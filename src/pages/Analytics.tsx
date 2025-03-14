
import React from 'react';
import Header from '@/components/layout/Header';
import AnalyticsDisplay from '@/components/analytics/AnalyticsDisplay';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { LineChart, BarChart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

const Analytics = () => {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-background to-muted/50">
      <Header />
      
      <main className="flex-1 flex flex-col items-center justify-center p-6">
        <div className="w-full max-w-4xl mx-auto">
          {/* Header */}
          <div className="flex justify-between mb-6 animate-slide-up stagger-1">
            <Badge variant="outline" className="px-3 py-1 bg-muted/50 backdrop-blur-sm">
              <LineChart className="h-3 w-3 mr-1" />
              <span>Productivity Insights</span>
            </Badge>
            
            {/* Back to timer button */}
            <Link to="/">
              <Button variant="outline" size="sm">
                Back to Timer
              </Button>
            </Link>
          </div>
          
          {/* Main Analytics Card */}
          <Card className="p-6 mb-8 animate-slide-up stagger-2">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold">Your Productivity Stats</h2>
              <BarChart className="h-5 w-5 text-muted-foreground" />
            </div>
            
            <AnalyticsDisplay />
          </Card>
        </div>
      </main>
      
      {/* Footer */}
      <footer className="py-6 text-center text-sm text-muted-foreground">
        <p>Transformers Timer &copy; {new Date().getFullYear()}</p>
      </footer>
    </div>
  );
};

export default Analytics;
