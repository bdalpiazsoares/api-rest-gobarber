import User from '../models/User';
import Notification from '../schemas/Notification';

class NotificationController {
  async index(req, res) {
    const checkIsProvider = await User.findOne({
      where: { id: req.userId, provider: true},
    });
    if(!checkIsProvider) {
      res.status(401).json({ error: 'Only provider can load notifications'});
    }

    const notifications = await Notification.find({ //find = findAll do sql
      user: req.userId, 
    })
      .sort({ createdAt: 'desc' }) // ordenar por ordem decrescente
      .limit(20); // limitar 20 por página

    return res.json(notifications);
  }

  async update(req, res) {
    const notification = await Notification.findByIdAndUpdate(//busca e atualiza
      req.params.id,
      {read: true},
      {new: true},
    );
    return res.json(notification);
  }

}

export default new NotificationController();