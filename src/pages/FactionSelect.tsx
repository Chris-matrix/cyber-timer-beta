import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { toast } from 'sonner';

const factions = [
  {
    id: 'autobots',
    name: 'Autobots',
    description: 'Defenders of peace and justice',
    color: 'bg-autobot text-white',
    theme: {
      primary: '#FF4D4D',
      secondary: '#FFD700'
    }
  },
  {
    id: 'decepticons',
    name: 'Decepticons',
    description: 'Masters of conquest and power',
    color: 'bg-decepticon text-white',
    theme: {
      primary: '#800080',
      secondary: '#32CD32'
    }
  },
  {
    id: 'maximals',
    name: 'Maximals',
    description: 'Protectors of nature and harmony',
    color: 'bg-cybertron text-white',
    theme: {
      primary: '#4169E1',
      secondary: '#FFB6C1'
    }
  }
];

export default function FactionSelect() {
  const navigate = useNavigate();

  const selectFaction = (faction: typeof factions[0]) => {
    localStorage.setItem('selectedFaction', JSON.stringify(faction));
    toast.success(`Welcome to the ${faction.name}!`);
    navigate('/');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 to-gray-800">
      <div className="container max-w-6xl p-8">
        <h1 className="text-5xl font-bold text-center text-white mb-12">Choose Your Faction</h1>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {factions.map((faction) => (
            <Card 
              key={faction.id}
              className="hover:scale-105 transition-transform cursor-pointer"
              onClick={() => selectFaction(faction)}
            >
              <CardHeader className={faction.color}>
                <CardTitle className="text-2xl">{faction.name}</CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <p className="text-lg mb-4">{faction.description}</p>
                <Button className={`w-full ${faction.color}`}>
                  Join {faction.name}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
