import * as Yup from 'yup';
import { startOfHour, parseISO, isBefore } from 'date-fns';

import User from '../models/User';
import File from '../models/File';
import Appointment from '../models/Appointment';

class AppointmentController {
  async index(req, res) {
    const appointments = await Appointment.findAll({
      where: {
        user_id: req.userId,
        canceled_at: null,
      },
      order: ['date'],
      attributes: ['id', 'date'],
      include: [
        {
          model: User,
          as: 'provider',
          attributes: ['id', 'name'],
          include: [
            {
              model: File,
              as: 'avatar',
              attributes: ['path', 'url'],
            },
          ],
        },
      ],
    });

    return res.json(appointments);
  }

  async store(req, res) {
    const schema = Yup.object().shape({
      provider_id: Yup.number().required(),
      date: Yup.date().required(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Body schema fails' });
    }

    const { provider_id, date } = req.body;

    /**
     * Check if provider_id is a provider
     */

    const isProvider = await User.findOne({
      where: { provider: true, id: provider_id },
    });

    if (!isProvider) {
      return res.status(401).json({ error: 'Property provider_id is invalid' });
    }

    /**
     * Check for past dates
     */

    const hourStart = startOfHour(parseISO(date));

    if (isBefore(hourStart, new Date())) {
      return res.status(400).json({ error: 'Past dates are not allowed!' });
    }

    /**
     * Check if date is available
     */

    const checkIsDateAvailable = await Appointment.findOne({
      where: {
        provider_id,
        canceled_at: null,
        date: hourStart,
      },
    });

    if (checkIsDateAvailable) {
      return res.status(400).json({ error: 'This date is not available!' });
    }

    const appointment = await Appointment.create({
      user_id: req.userId,
      provider_id,
      date,
    });

    return res.json(appointment);
  }
}

export default new AppointmentController();