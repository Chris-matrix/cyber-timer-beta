const NOTIFICATION_SOUNDS = {
  autobots: new Audio('/sounds/autobots-transform.mp3'),
  decepticons: new Audio('/sounds/decepticons-transform.mp3'),
  allspark: new Audio('/sounds/allspark-pulse.mp3'),
};

export const playNotificationSound = (faction: 'autobots' | 'decepticons' | 'allspark' = 'autobots') => {
  try {
    const sound = NOTIFICATION_SOUNDS[faction];
    if (sound) {
      sound.currentTime = 0;
      sound.play().catch(console.error);
    }
  } catch (error) {
    console.error('Error playing notification sound:', error);
  }
};
