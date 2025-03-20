// Define sound types for different timer actions
type SoundType = 'start' | 'pause' | 'complete' | 'break' | 'reset' | 'transform';

// Create a mapping of sound types to audio files for each faction
const SOUND_EFFECTS: Record<string, Record<SoundType, string>> = {
  autobots: {
    start: '/sounds/autobots-roll-out.mp3',
    pause: '/sounds/autobots-hold.mp3',
    complete: '/sounds/autobots-victory.mp3',
    break: '/sounds/autobots-recharge.mp3',
    reset: '/sounds/autobots-regroup.mp3',
    transform: '/sounds/autobots-transform.mp3',
  },
  decepticons: {
    start: '/sounds/decepticons-attack.mp3',
    pause: '/sounds/decepticons-halt.mp3',
    complete: '/sounds/decepticons-victory.mp3',
    break: '/sounds/decepticons-recharge.mp3',
    reset: '/sounds/decepticons-retreat.mp3',
    transform: '/sounds/decepticons-transform.mp3',
  },
  maximals: {
    start: '/sounds/maximals-maximize.mp3',
    pause: '/sounds/maximals-hold.mp3',
    complete: '/sounds/maximals-victory.mp3',
    break: '/sounds/maximals-recharge.mp3',
    reset: '/sounds/maximals-regroup.mp3',
    transform: '/sounds/maximals-transform.mp3',
  },
  predacons: {
    start: '/sounds/predacons-terrorize.mp3',
    pause: '/sounds/predacons-halt.mp3',
    complete: '/sounds/predacons-victory.mp3',
    break: '/sounds/predacons-recharge.mp3',
    reset: '/sounds/predacons-retreat.mp3',
    transform: '/sounds/predacons-transform.mp3',
  },
  allspark: {
    start: '/sounds/allspark-activate.mp3',
    pause: '/sounds/allspark-pause.mp3',
    complete: '/sounds/allspark-complete.mp3',
    break: '/sounds/allspark-recharge.mp3',
    reset: '/sounds/allspark-reset.mp3',
    transform: '/sounds/allspark-transform.mp3',
  },
};

// Fallback sounds if faction-specific sounds aren't available
const FALLBACK_SOUNDS: Record<SoundType, string> = {
  start: '/sounds/start.mp3',
  pause: '/sounds/pause.mp3',
  complete: '/sounds/complete.mp3',
  break: '/sounds/break.mp3',
  reset: '/sounds/reset.mp3',
  transform: '/sounds/transform.mp3',
};

// Cache audio objects to avoid recreating them
const audioCache: Record<string, HTMLAudioElement> = {};

// Create a silent audio element for fallback when files don't exist
const createSilentAudio = () => {
  const audio = new Audio();
  audio.volume = 0;
  return audio;
};

// Silent audio fallback
const silentAudio = createSilentAudio();

/**
 * Play a notification sound based on the faction and sound type
 * @param soundType - Type of sound to play (start, pause, complete, etc.)
 * @param faction - Faction preference (autobots, decepticons, maximals, predacons, allspark)
 */
export const playNotificationSound = (
  soundType: SoundType = 'complete',
  faction: 'autobots' | 'decepticons' | 'maximals' | 'predacons' | 'allspark' = 'autobots'
) => {
  try {
    // Get the appropriate sound file path
    const soundPath = 
      (SOUND_EFFECTS[faction] && SOUND_EFFECTS[faction][soundType]) || 
      FALLBACK_SOUNDS[soundType];
    
    if (!soundPath) {
      console.warn(`No sound found for ${soundType} (${faction})`);
      return;
    }
    
    // Check if we already have this audio loaded
    if (!audioCache[soundPath]) {
      audioCache[soundPath] = new Audio(soundPath);
      
      // Add error handler for the first load to detect missing files
      audioCache[soundPath].addEventListener('error', () => {
        console.warn(`Sound file not found: ${soundPath}`);
        // Remove from cache so we don't keep trying to load it
        delete audioCache[soundPath];
      });
    }
    
    // If the audio is in the cache, play it
    if (audioCache[soundPath]) {
      const sound = audioCache[soundPath];
      sound.currentTime = 0;
      
      // Play the sound with error handling
      sound.play().catch(error => {
        console.warn(`Error playing sound (${soundType}, ${faction}): ${error.message}`);
        
        // If it's a user interaction error, we'll try again when the user interacts
        if (error.name === 'NotAllowedError') {
          // We'll handle this silently - the browser requires user interaction
          return;
        }
        
        // For other errors like missing files, use the silent audio
        silentAudio.currentTime = 0;
        silentAudio.play().catch(() => {
          // If even silent audio fails, we give up silently
        });
      });
    } else {
      // If the sound isn't in the cache (likely failed to load), use silent audio
      silentAudio.currentTime = 0;
      silentAudio.play().catch(() => {
        // If even silent audio fails, we give up silently
      });
    }
  } catch (error) {
    console.error('Error in playNotificationSound:', error);
  }
};

// Create a placeholder sound directory with a README
const createSoundDirectories = () => {
  console.log('Sound directories should be created at:');
  console.log('/sounds/ - for all transformer sound effects');
};

// Export for potential setup use
export { createSoundDirectories };
