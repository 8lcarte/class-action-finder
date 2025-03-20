import { supabase } from '@/lib/supabase';

export interface NotificationData {
  userId: string;
  type: 'claim_update' | 'deadline' | 'new_lawsuit' | 'system';
  content: string;
  data?: Record<string, any>;
}

export interface NotificationPreferences {
  email: boolean;
  sms: boolean;
  push: boolean;
  inApp: boolean;
  frequency: 'immediate' | 'daily' | 'weekly';
  quietHours?: {
    start: string; // HH:MM format
    end: string; // HH:MM format
  };
}

export async function createNotification(notification: NotificationData): Promise<{ id: string } | null> {
  const { data, error } = await supabase
    .from('user_notifications')
    .insert([
      {
        user_id: notification.userId,
        type: notification.type,
        content: notification.content,
        data: notification.data || {},
        read: false
      }
    ])
    .select('id')
    .single();

  if (error) {
    console.error('Error creating notification:', error);
    return null;
  }

  return { id: data.id };
}

export async function getUserNotifications(userId: string, includeRead = false): Promise<any[]> {
  let query = supabase
    .from('user_notifications')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (!includeRead) {
    query = query.eq('read', false);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching user notifications:', error);
    return [];
  }

  return data;
}

export async function markNotificationAsRead(notificationId: string): Promise<boolean> {
  const { error } = await supabase
    .from('user_notifications')
    .update({ read: true })
    .eq('id', notificationId);

  if (error) {
    console.error('Error marking notification as read:', error);
    return false;
  }

  return true;
}

export async function markAllNotificationsAsRead(userId: string): Promise<boolean> {
  const { error } = await supabase
    .from('user_notifications')
    .update({ read: true })
    .eq('user_id', userId)
    .eq('read', false);

  if (error) {
    console.error('Error marking all notifications as read:', error);
    return false;
  }

  return true;
}

export async function deleteNotification(notificationId: string): Promise<boolean> {
  const { error } = await supabase
    .from('user_notifications')
    .delete()
    .eq('id', notificationId);

  if (error) {
    console.error('Error deleting notification:', error);
    return false;
  }

  return true;
}

export async function getUserNotificationPreferences(userId: string): Promise<NotificationPreferences | null> {
  const { data, error } = await supabase
    .from('users')
    .select('preferences')
    .eq('id', userId)
    .single();

  if (error) {
    console.error('Error fetching notification preferences:', error);
    return null;
  }

  const preferences = data.preferences || {};
  
  return {
    email: preferences.notificationPreferences?.email ?? true,
    sms: preferences.notificationPreferences?.sms ?? false,
    push: preferences.notificationPreferences?.push ?? true,
    inApp: preferences.notificationPreferences?.inApp ?? true,
    frequency: preferences.notificationPreferences?.frequency ?? 'immediate',
    quietHours: preferences.notificationPreferences?.quietHours
  };
}

export async function updateNotificationPreferences(userId: string, preferences: NotificationPreferences): Promise<boolean> {
  // First get the current user to update preferences
  const { data: currentUser, error: fetchError } = await supabase
    .from('users')
    .select('preferences')
    .eq('id', userId)
    .single();

  if (fetchError) {
    console.error('Error fetching user for preference update:', fetchError);
    return false;
  }

  const userPreferences = currentUser.preferences || {};
  
  userPreferences.notificationPreferences = preferences;

  const { error } = await supabase
    .from('users')
    .update({
      preferences: userPreferences
    })
    .eq('id', userId);

  if (error) {
    console.error('Error updating notification preferences:', error);
    return false;
  }

  return true;
}

export async function shouldSendNotification(userId: string, type: string): Promise<boolean> {
  // Get user notification preferences
  const preferences = await getUserNotificationPreferences(userId);
  
  if (!preferences) {
    return true; // Default to sending if preferences not found
  }
  
  // Check if any notification channel is enabled
  const anyChannelEnabled = preferences.email || preferences.sms || preferences.push || preferences.inApp;
  
  if (!anyChannelEnabled) {
    return false;
  }
  
  // Check quiet hours if defined
  if (preferences.quietHours) {
    const now = new Date();
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();
    const currentTime = currentHour * 60 + currentMinute;
    
    const [startHour, startMinute] = preferences.quietHours.start.split(':').map(Number);
    const [endHour, endMinute] = preferences.quietHours.end.split(':').map(Number);
    
    const startTime = startHour * 60 + startMinute;
    const endTime = endHour * 60 + endMinute;
    
    // Check if current time is within quiet hours
    if (startTime < endTime) {
      // Normal case: start time is before end time
      if (currentTime >= startTime && currentTime <= endTime) {
        return false;
      }
    } else {
      // Overnight case: start time is after end time (e.g., 22:00 to 06:00)
      if (currentTime >= startTime || currentTime <= endTime) {
        return false;
      }
    }
  }
  
  // Check frequency for non-critical notifications
  if (type !== 'claim_update' && type !== 'deadline') {
    if (preferences.frequency === 'daily' || preferences.frequency === 'weekly') {
      // For non-immediate preferences, we'd typically batch these
      // and send them according to a schedule
      return false;
    }
  }
  
  return true;
}

export async function createBatchedNotifications(userId: string, frequency: 'daily' | 'weekly'): Promise<boolean> {
  // This would typically be called by a scheduled job
  // For now, we'll implement a simplified version
  
  // Get all unread notifications for this user
  const { data: notifications, error } = await supabase
    .from('user_notifications')
    .select('*')
    .eq('user_id', userId)
    .eq('read', false);
    
  if (error) {
    console.error('Error fetching notifications for batching:', error);
    return false;
  }
  
  if (notifications.length === 0) {
    return true; // No notifications to batch
  }
  
  // Group notifications by type
  const groupedNotifications: Record<string, any[]> = {};
  
  notifications.forEach(notification => {
    const type = notification.type;
    if (!groupedNotifications[type]) {
      groupedNotifications[type] = [];
    }
    groupedNotifications[type].push(notification);
  });
  
  // Create a summary notification for each type
  for (const [type, typeNotifications] of Object.entries(groupedNotifications)) {
    let content = '';
    
    if (typeNotifications.length === 1) {
      content = typeNotifications[0].content;
    } else {
      switch (type) {
        case 'claim_update':
          content = `You have ${typeNotifications.length} updates to your claims.`;
          break;
        case 'deadline':
          content = `You have ${typeNotifications.length} upcoming deadlines.`;
          break;
        case 'new_lawsuit':
          content = `There are ${typeNotifications.length} new lawsuits that may be relevant to you.`;
          break;
        default:
          content = `You have ${typeNotifications.length} new notifications.`;
      }
    }
    
    // Create the batched notification
    await createNotification({
      userId,
      type: type as any,
      content,
      data: {
        batched: true,
        count: typeNotifications.length,
        frequency,
        notificationIds: typeNotifications.map(n => n.id)
      }
    });
  }
  
  return true;
}
