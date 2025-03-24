/**
 * Audio Management for Transformers Timer
 * 
 * This module handles all sound effects and audio playback for the application.
 * It includes functions for playing notification sounds based on user preferences
 * and faction selection, with fallback options if specific sounds aren't available.
 */

export type SoundType = 'complete' | 'start' | 'pause' | 'reset' | 'transform';

// Base path for all sound effects
const SOUND_BASE_PATH = '/sounds';

// Mapping of faction-specific sound effects
const FACTION_SOUNDS: Record<string, Record<SoundType, string>> = {
  autobots: {
    complete: `${SOUND_BASE_PATH}/complete.mp3`,
    start: `${SOUND_BASE_PATH}/complete.mp3`, // Fallback to complete sound
    pause: `${SOUND_BASE_PATH}/complete.mp3`, // Fallback to complete sound
    reset: `${SOUND_BASE_PATH}/complete.mp3`, // Fallback to complete sound
    transform: `${SOUND_BASE_PATH}/transform.mp3`,
  },
  decepticons: {
    complete: `${SOUND_BASE_PATH}/complete.mp3`,
    start: `${SOUND_BASE_PATH}/complete.mp3`, // Fallback to complete sound
    pause: `${SOUND_BASE_PATH}/complete.mp3`, // Fallback to complete sound
    reset: `${SOUND_BASE_PATH}/complete.mp3`, // Fallback to complete sound
    transform: `${SOUND_BASE_PATH}/transform.mp3`,
  },
  maximals: {
    complete: `${SOUND_BASE_PATH}/complete.mp3`,
    start: `${SOUND_BASE_PATH}/complete.mp3`, // Fallback to complete sound
    pause: `${SOUND_BASE_PATH}/complete.mp3`, // Fallback to complete sound
    reset: `${SOUND_BASE_PATH}/complete.mp3`, // Fallback to complete sound
    transform: `${SOUND_BASE_PATH}/transform.mp3`,
  },
  predacons: {
    complete: `${SOUND_BASE_PATH}/complete.mp3`,
    start: `${SOUND_BASE_PATH}/complete.mp3`, // Fallback to complete sound
    pause: `${SOUND_BASE_PATH}/complete.mp3`, // Fallback to complete sound
    reset: `${SOUND_BASE_PATH}/complete.mp3`, // Fallback to complete sound
    transform: `${SOUND_BASE_PATH}/transform.mp3`,
  },
  allspark: {
    complete: `${SOUND_BASE_PATH}/complete.mp3`,
    start: `${SOUND_BASE_PATH}/complete.mp3`, // Fallback to complete sound
    pause: `${SOUND_BASE_PATH}/complete.mp3`, // Fallback to complete sound
    reset: `${SOUND_BASE_PATH}/complete.mp3`, // Fallback to complete sound
    transform: `${SOUND_BASE_PATH}/transform.mp3`,
  }
};

// Fallback sounds if faction-specific sounds aren't available
const FALLBACK_SOUNDS: Record<SoundType, string> = {
  complete: `${SOUND_BASE_PATH}/complete.mp3`,
  start: `${SOUND_BASE_PATH}/complete.mp3`, // Fallback to complete sound
  pause: `${SOUND_BASE_PATH}/complete.mp3`, // Fallback to complete sound
  reset: `${SOUND_BASE_PATH}/complete.mp3`, // Fallback to complete sound
  transform: `${SOUND_BASE_PATH}/transform.mp3`,
};

// Audio cache to prevent reloading the same sounds
const audioCache: Record<string, HTMLAudioElement> = {};

// Track if user has interacted with the page
let hasUserInteracted = false;

// Listen for user interaction to enable audio
window.addEventListener('click', () => {
  hasUserInteracted = true;
});

window.addEventListener('keydown', () => {
  hasUserInteracted = true;
});

/**
 * Plays a notification sound based on the faction and sound type
 * Falls back to general sounds if faction-specific sounds aren't available
 * 
 * @param {SoundType} soundType - Type of sound to play (complete, start, pause, reset, transform)
 * @param {string} faction - User's selected faction (autobots, decepticons, maximals, predacons, allspark)
 * @returns {Promise<void>} Promise that resolves when the sound has played
 */
export const playNotificationSound = async (
  soundType: SoundType = 'complete', 
  faction: 'autobots' | 'decepticons' | 'maximals' | 'predacons' | 'allspark' = 'autobots'
): Promise<void> => {
  // Check if user has interacted with the page (browsers require user interaction for audio)
  if (!hasUserInteracted) {
    console.warn('Cannot play sound before user interaction');
    return;
  }

  try {
    // Get the appropriate sound file path
    const factionSounds = FACTION_SOUNDS[faction] || FACTION_SOUNDS.autobots;
    const soundPath = factionSounds[soundType] || FALLBACK_SOUNDS[soundType];
    
    // Check if sound is already cached
    if (!audioCache[soundPath]) {
      const audio = new Audio(soundPath);
      audio.volume = 0.7; // Set volume to 70%
      audioCache[soundPath] = audio;
    }
    
    const audio = audioCache[soundPath];
    
    // Reset audio to beginning if it was already played
    if (!audio.paused) {
      audio.pause();
    }
    audio.currentTime = 0;
    
    // Play the sound with error handling
    try {
      await audio.play();
    } catch (error) {
      console.warn(`Failed to play sound (${soundType}) for faction ${faction}, trying fallback`, error);
      
      // Try fallback sound if faction-specific sound fails
      const fallbackPath = FALLBACK_SOUNDS[soundType];
      
      if (!audioCache[fallbackPath]) {
        const fallbackAudio = new Audio(fallbackPath);
        fallbackAudio.volume = 0.7;
        audioCache[fallbackPath] = fallbackAudio;
      }
      
      const fallbackAudio = audioCache[fallbackPath];
      fallbackAudio.currentTime = 0;
      await fallbackAudio.play().catch(err => {
        console.error('Even fallback sound failed to play:', err);
      });
    }
  } catch (error) {
    console.error('Error playing notification sound:', error);
  }
};

/**
 * Preloads all sound effects for faster playback
 * This can be called on app initialization to cache sounds
 */
export const preloadSounds = (): void => {
  // Preload all faction sounds
  Object.values(FACTION_SOUNDS).forEach(factionSounds => {
    Object.values(factionSounds).forEach(soundPath => {
      if (!audioCache[soundPath]) {
        const audio = new Audio();
        audio.src = soundPath;
        audio.preload = 'auto';
        audioCache[soundPath] = audio;
        
        // Add error handling for preloading
        audio.addEventListener('error', () => {
          console.warn(`Failed to preload sound: ${soundPath}`);
        });
      }
    });
  });
  
  // Also preload fallback sounds
  Object.values(FALLBACK_SOUNDS).forEach(soundPath => {
    if (!audioCache[soundPath]) {
      const audio = new Audio();
      audio.src = soundPath;
      audio.preload = 'auto';
      audioCache[soundPath] = audio;
      
      // Add error handling for preloading
      audio.addEventListener('error', () => {
        console.warn(`Failed to preload fallback sound: ${soundPath}`);
      });
    }
  });
  
  console.log('All sounds preloaded successfully');
};
