import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { FACTIONS, CHARACTERS } from './Timer';
import Logo from './Logo';

export default function LoadingScreen() {
  const [selectedFaction, setSelectedFaction] = useState(() => {
    const stored = localStorage.getItem('selectedFaction');
    return stored ? JSON.parse(stored) : null;
  });

  const [selectedCharacter, setSelectedCharacter] = useState(() => {
    const stored = localStorage.getItem('selectedCharacter');
    return stored ? JSON.parse(stored) : null;
  });

  const handleFactionSelect = (faction: typeof FACTIONS[0]) => {
    setSelectedFaction(faction);
    setSelectedCharacter(null);
    localStorage.setItem('selectedFaction', JSON.stringify(faction));
    localStorage.setItem('selectedCharacter', 'null');
  };

  const handleCharacterSelect = (character: typeof CHARACTERS[0]) => {
    setSelectedCharacter(character);
    localStorage.setItem('selectedCharacter', JSON.stringify(character));
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black relative overflow-hidden flex flex-col items-center justify-center p-4"
    >
      <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />
      
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="mb-8"
      >
        <Logo className="w-24 h-24 text-white/80" />
      </motion.div>

      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="max-w-2xl w-full space-y-8 relative z-10"
      >
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold text-white">Choose Your Faction</h1>
          <p className="text-white/60">Select your allegiance in the war for Cybertron</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {FACTIONS.map((faction) => (
            <motion.div
              key={faction.id}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Button
                variant={selectedFaction?.id === faction.id ? 'default' : 'outline'}
                className={`w-full h-32 ${
                  faction.id === 'autobots' ? 'hover:bg-blue-500/20' :
                  faction.id === 'decepticons' ? 'hover:bg-red-500/20' :
                  'hover:bg-green-500/20'
                } hover:text-white transition-all duration-300 backdrop-blur-sm bg-black/20 border-white/10`}
                onClick={() => handleFactionSelect(faction)}
              >
                <div className="text-center">
                  <div className={`text-xl font-bold mb-2 ${faction.color.text}`}>{faction.name}</div>
                  <div className="text-sm opacity-75">{faction.description}</div>
                </div>
              </Button>
            </motion.div>
          ))}
        </div>

        {selectedFaction && (
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="space-y-4"
          >
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-bold text-white">Select Your Character</h2>
              <p className="text-white/60">Choose your digital companion</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {CHARACTERS
                .filter(char => char.faction === selectedFaction.id)
                .map((character) => (
                  <motion.div
                    key={character.id}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Button
                      variant={selectedCharacter?.id === character.id ? 'default' : 'outline'}
                      className={`w-full h-auto py-4 text-left ${selectedFaction.color.hover} backdrop-blur-sm bg-black/20 border-white/10`}
                      onClick={() => handleCharacterSelect(character)}
                    >
                      <div>
                        <div className="font-bold mb-1">{character.name}</div>
                        <div className="text-sm opacity-90">{character.description}</div>
                        <div className="text-xs italic mt-2 opacity-75">{character.quote}</div>
                      </div>
                    </Button>
                  </motion.div>
                ))}
            </div>
          </motion.div>
        )}

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: selectedCharacter ? 1 : 0 }}
          className="flex justify-center"
        >
          <div className={`text-sm ${selectedFaction?.color.text} text-center italic max-w-md`}>
            {selectedCharacter?.quote}
          </div>
        </motion.div>
      </motion.div>
    </motion.div>
  );
}
