import { Request, Response } from 'express';

import DecodeJWTToken from '../utils/DecodeJWTToken';

import User from '../models/User';
import capitalizeFirstLetter from '../utils/capitalizeFirstLetter';

export default {
  async index(request: Request, response: Response) {
    const _id = await DecodeJWTToken(request);

    const user = await User.findOne({ _id });

    if (!user) return response.status(400).json({ error: 'User not found' });

    return response.status(200).json(user.financeSettings?.areas);
  },

  async store(request: Request, response: Response) {
    const { area } = request.body;

    if (area === '')
      return response.status(400).json({ error: 'Invalid area.' });

    const newArea = capitalizeFirstLetter(area);

    const _id = await DecodeJWTToken(request);

    const user = await User.findOne({ _id });

    if (!user) return response.status(400).json({ error: 'User not found' });

    const oldUserAreas = user.financeSettings.areas?.map(area =>
      capitalizeFirstLetter(area)
    );

    if (oldUserAreas?.indexOf(newArea) !== -1)
      return response.status(400).json({
        Error: 'The user already has this area in his profile settings'
      });

    await User.findOneAndUpdate(
      { _id },
      {
        financeSettings: {
          areas: [...oldUserAreas, newArea]
        }
      }
    ).catch(error => response.status(400).json(error));

    return response.status(202).send();
  },

  async update(request: Request, response: Response) {
    const { oldAreaIndex } = request.params;

    const { area } = request.body;

    const index = parseInt(oldAreaIndex);

    const newArea = capitalizeFirstLetter(area);

    const _id = await DecodeJWTToken(request);

    const user = await User.findOne({ _id });

    if (!user) return response.status(400).json({ error: 'User not found' });

    if (!user.financeSettings.areas)
      return response.status(400).json({ error: 'User has no areas' });

    const oldArea = user.financeSettings.areas[index];

    if (oldArea === newArea) {
      return response
        .status(400)
        .json({ error: 'New area matches the old one' });
    }

    if (user.financeSettings.areas.includes(newArea))
      return response.status(400).json({ error: 'Area already exists' });
    const newAreas = user.financeSettings.areas;

    newAreas[index] = newArea;

    await User.findOneAndUpdate(
      { _id },
      {
        financeSettings: {
          areas: newAreas
        }
      }
    ).catch(error => response.status(400).json(error));

    return response.status(204).send();
  },

  async delete(request: Request, response: Response) {
    const { index } = request.params;

    const deletedAreaIndex = parseInt(index);

    const _id = await DecodeJWTToken(request);

    const user = await User.findOne({ _id });

    if (!user) return response.status(400).json({ error: 'User not found' });

    const userAreas = user.financeSettings.areas;

    if (!userAreas)
      return response.status(400).json({ error: 'User areas not found' });

    if (deletedAreaIndex > userAreas.length - 1)
      return response.status(400).json({ error: 'Index out of bounds' });

    const newAreaArray = userAreas.filter(
      (_, index) => index !== deletedAreaIndex
    );

    await User.findOneAndUpdate(
      { _id },
      {
        financeSettings: {
          areas: newAreaArray
        }
      }
    ).catch(error => response.status(400).json(error));

    return response.status(204).send();
  }
};
