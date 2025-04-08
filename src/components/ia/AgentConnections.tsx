import React from 'react';
import { Agent } from '../../types/agent';

interface AgentConnectionsProps {
  agents: Agent[];
  selectedAgent: Agent | null;
  onConnect: (sourceId: string, targetId: string) => void;
  onDisconnect: (sourceId: string, targetId: string) => void;
}

const AgentConnections: React.FC<AgentConnectionsProps> = ({
  agents,
  selectedAgent,
  onConnect,
  onDisconnect,
}) => {
  if (!selectedAgent) return null;

  return (
    <div className="mt-6">
      <h3 className="text-lg font-medium text-gray-900 mb-4">Connexions</h3>
      <div className="space-y-4">
        {agents
          .filter(agent => agent.id !== selectedAgent.id)
          .map(agent => (
            <div key={agent.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div>
                <h4 className="font-medium">{agent.name}</h4>
                <p className="text-sm text-gray-500">{agent.description}</p>
              </div>
              {selectedAgent.connections.includes(agent.id) ? (
                <button
                  onClick={() => onDisconnect(selectedAgent.id, agent.id)}
                  className="px-3 py-1 text-sm text-red-600 hover:text-red-800"
                >
                  Déconnecter
                </button>
              ) : (
                <button
                  onClick={() => onConnect(selectedAgent.id, agent.id)}
                  className="px-3 py-1 text-sm text-blue-600 hover:text-blue-800"
                >
                  Connecter
                </button>
              )}
            </div>
          ))}
      </div>
    </div>
  );
};

export default AgentConnections; 