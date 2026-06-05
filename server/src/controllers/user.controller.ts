import { Request, Response } from 'express';
import { supabaseAdmin } from '../config/supabaseClient.js';

export const getProfile = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    const { data, error } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) throw error;
    res.json({ success: true, data });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateProfile = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    const {
      height,
      weight,
      age,
      gender,
      activity_level,
      daily_calories,
      daily_protein,
      daily_carbs,
      daily_fat
    } = req.body;

    const { data, error } = await supabaseAdmin
      .from('users')
      .update({
        height,
        weight,
        age,
        gender,
        activity_level,
        daily_calories,
        daily_protein,
        daily_carbs,
        daily_fat
      })
      .eq('id', userId)
      .select()
      .single();

    if (error) throw error;

    res.json({ success: true, data });
  } catch (error: any) {
    console.error('Update profile error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};
