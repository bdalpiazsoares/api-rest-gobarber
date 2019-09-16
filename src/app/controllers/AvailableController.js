import { 
startOfDay, 
endOfDay, 
setHours, 
setMinutes, 
setSeconds, 
format, 
isAfter } 
from 'date-fns';

import Appointment from '../models/Appointment';
import {Op} from 'sequelize';

class AvailableController {
  async index(req, res) {
    const { date } = req.query;

    if(!date) {
      return res.status(400).json({error: "Invalid date"})
    }
    const searchDate = Number(date); //ou parseInt-transforma o date num inteiro

    const appointments = await Appointment.findAll({
      where: {
        provider_id: req.params.providerId,
        canceled_at: null,
        date: {
          [Op.between]: [startOfDay(searchDate), endOfDay(searchDate)],
        },
      }, 
    });
    // schedule - todos os horários disponíveis
    const schedule = [
      '08:00',
      '09:00',
      '10:00',
      '11:00',
      '12:00',
      '13:00',
      '14:00',
      '15:00',
      '16:00',
      '17:00',
      '18:00',
      '19:00',
    ];

    const available = schedule.map(time => {
      //tudo que vier antes dos dois pontos é hour e depois é minute
      const [hour, minute] = time.split(':');
      const value = setSeconds(setMinutes(setHours(searchDate, hour), minute), 0);
           // o value resulta em: 2018-06-23 08:00:00

      return {
        time,
        value: format(value, "yyyy-MM-dd'T'HH:mm:ssxxx"),
        available: 
        // verifica se o value vai acontecer depois do new Date(data atual)
          isAfter(value, new Date()) && 
          !appointments.find(a => format(a.date, 'HH:mm') === time)
      };
    });
    return res.json(available);
  }
}

export default new AvailableController();