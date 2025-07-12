import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Settings } from 'lucide-react';
import { 
  environments, 
  getCurrentEnvironment, 
  switchEnvironment, 
  getAvailableEnvironments 
} from '@/config/environments';

export function EnvironmentSwitcher() {
  const [currentEnv, setCurrentEnv] = useState(getCurrentEnvironment());
  const currentConfig = environments[currentEnv];

  const handleEnvironmentSwitch = (env: string) => {
    setCurrentEnv(env);
    switchEnvironment(env);
  };

  const getEnvironmentColor = (env: string) => {
    switch (env) {
      case 'local':
        return 'bg-blue-500/10 text-blue-600 border-blue-200';
      case 'dev':
        return 'bg-green-500/10 text-green-600 border-green-200';
      case 'qa':
        return 'bg-yellow-500/10 text-yellow-600 border-yellow-200';
      case 'prod':
        return 'bg-red-500/10 text-red-600 border-red-200';
      default:
        return 'bg-gray-500/10 text-gray-600 border-gray-200';
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="h-8 gap-2">
          <Settings className="h-4 w-4" />
          <Badge 
            variant="outline" 
            className={`h-5 text-xs ${getEnvironmentColor(currentEnv)}`}
          >
            {currentEnv.toUpperCase()}
          </Badge>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64">
        <div className="p-2 text-xs text-muted-foreground border-b">
          <div>Current: {currentConfig.name}</div>
          <div className="font-mono text-xs">{currentConfig.apiBaseUrl}</div>
        </div>
        {getAvailableEnvironments().map((env) => (
          <DropdownMenuItem
            key={env}
            onClick={() => handleEnvironmentSwitch(env)}
            className="flex items-center gap-2"
          >
            <Badge 
              variant="outline" 
              className={`h-5 text-xs ${getEnvironmentColor(env)}`}
            >
              {env.toUpperCase()}
            </Badge>
            <div className="flex flex-col">
              <span className="font-medium">{environments[env].name}</span>
              <span className="text-xs text-muted-foreground font-mono">
                {environments[env].apiBaseUrl}
              </span>
            </div>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}