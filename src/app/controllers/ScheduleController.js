// listar os agendamentos do prestador de serviços
import { startOfDay, endOfDay, parseISO} from 'date-fns';
import { Op } from 'sequelize';

import User from '../models/User';
import Appointment from '../models/Appointment';



class ScheduleController {
  async index(req, res) {
    const checkUserProvider = await User.findOne({
      where: { id: req.userId, provider: true }
    });

    if (!checkUserProvider) {
      return res.status(401).json({error: 'User is a not provider '});
    }

    

    //2019-06-22 00:00:00
    //2019-06-22 23:59:59
    // vai pegar os agendamentos entre estes horários
    const { date } = req.query;
    const parsedDate = parseISO(date);
    const appointments = await Appointment.findAll({
      where: {
        provider_id: req.userId,
        canceled_at: null,
        date: {
          [Op.between]: [startOfDay(parsedDate), endOfDay(parsedDate)]
        },
      },
      order: ['date'], //ordenar por data
    })

    return res.json(appointments)
  }
}

export default new ScheduleController();