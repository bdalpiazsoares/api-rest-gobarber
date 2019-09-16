import * as Yup from 'yup';
import { startOfHour, parseISO, isBefore, format, subHours } from 'date-fns';
import pt from 'date-fns/locale/pt';
import User from '../models/User';
import File from '../models/File';
import Appointment from '../models/Appointment';
import Notification from '../schemas/Notification';

import CancellationMail from '../jobs/CancellationMail';
import Queue from '../../lib/Queue';


class AppointmentController {
  async index(req, res) {
    const { page = 1 } = req.query; // se o user nao digitar a pag,o padrão é 1

    const appointments = await Appointment.findAll({
      where: { user_id: req.userId, canceled_at: null },
      order: ['date'],
      attributes:['id', 'date', 'past', 'cancelable'],
      limit: 20,
      offset: (page - 1) * 20, //mostra de 20 em 20 sem pular registros
      include: [
        {
          model: User,
          as: 'provider',
          attributes: ['id', 'name'],
          include: [
            {
              model: File,
              as: 'avatar',
              attributes: ['id', 'path', 'url'],
            },
          ],
        },
      ],
    });
    return res.json(appointments)
  }

  async store(req, res) {
    const schema = Yup.object().shape({
      provider_id: Yup.number().required(),
      date: Yup.date().required(),
    })

    if(!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation fails' });
    }
  
    const {provider_id, date} = req.body;

    //VER SE O PROVIDER_ID É UM PROVIDER
    const isProvider = await User.findOne({
      where: { id: provider_id, provider: true },
    });

    if(!isProvider) {
      return res
        .status(401)
        .json({ error: 'You can only create appointments with providers'});
    }
    
    // não permite que i provider e o usuario sejam os mesmos
    if(provider_id == req.userId) {
      return res.status(401).json({error: 'The provider and user are the same'})
    }

    const hourStart = startOfHour(parseISO(date));

    // se a hourstart do insomnia está antes do new Date que é a data atual
    if(isBefore(hourStart, new Date())) {
      return res.status(400).json({ error: 'Past dates are not permitted' });
    }    

    //Se o prestador de serviços já não tem hora marcada para o mesmo horário
    const checkAvailability = await Appointment.findOne({
      where: { 
        provider_id,
        canceled_at: null,
        date: hourStart,
      }
    });

    if(checkAvailability) {
      return res
        .status(400)
        .json({ error: 'Appointment date is not avaliable' });
    }

    // cria o appointment (compromisso);
    const appointment = await Appointment.create({
      user_id: req.userId,
      provider_id,
      date,
    });

    //Notificar prestador de serviço
    const user = await User.findByPk(req.userId);
    const formattedDate = format(
      hourStart,
      "'dia' dd 'de' MMMM', às' H:mm'h'", //igual a: dia 22 de junho, ás 8:40h
      { locale: pt }
    );
    
    await Notification.create({
      content: `Novo agendamento de ${user.name} para ${formattedDate}`,
      user: provider_id,
    })


    return res.json(appointment);
  }

  async delete(req, res) {
    const appointment = await Appointment.findByPk(req.params.id, {
      include: [ // vai pegar também os dados abaixo do provider
        {
          model: User,
          as: 'provider',
          attributes:['name', 'email'],
        },
        {
          model: User,
          as: 'user',
          attributes: ['name'],
        }
      ]
    });

    if(appointment.user_id !== req.userId) {
      return res.status(401).json({
        error: "You don't have permission do cancel this appointment",
      })
    }
    //baixa 2 horas da data do banco
    const dateWithSub = subHours(appointment.date, 2);
    //se a datewithsub for antes da hora atual
    if(isBefore(dateWithSub, new Date())) { 
      return res.status(401).json({error:
        //só pode cancelar 2 horas antes do atendimento
        'You can only cancel appointments 2 hours in advance',
      })
    }

    appointment.canceled_at = new Date();
    await appointment.save();

    await Queue.add(CancellationMail.key, {
      appointment,
    });

    return res.json(appointment);
  }

}

export default new AppointmentController();