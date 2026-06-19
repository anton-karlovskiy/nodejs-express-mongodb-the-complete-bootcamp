import axios from 'axios';
import { showAlert } from './alerts';

export const updateSettings = async (data: Record<string, unknown> | FormData, type: 'password' | 'data'): Promise<void> => {
  try {
    const url = type === 'password'
      ? '/api/v1/users/updateMyPassword'
      : '/api/v1/users/updateMe';

    const res = await axios({ method: 'PATCH', url, data });

    if (res.data.status === 'success') {
      showAlert('success', `${type.toUpperCase()} updated successfully!`);
    }
  } catch (err: any) {
    showAlert('error', err.response.data.message);
  }
};
