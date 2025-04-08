import React, { useState } from 'react';
import { Navbar } from '../src/components/shared/Navbar';
import AgentConnections from '../src/components/ia/AgentConnections';
import { Agent } from '../src/types/agent';

const IAAgentsPage: React.FC = () => {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);

  const addAgent = () => {
    const newAgent: Agent = {
      id: Date.now().toString(),
      name: `Agent ${agents.length + 1}`,
      description: '',
      capabilities: [],
      connections: [],
      type: 'analyzer',
      status: 'inactive',
      config: {
        model: 'gpt-3.5-turbo',
        temperature: 0.7,
        maxTokens: 1000
      }
    };
    setAgents([...agents, newAgent]);
  };

  const updateAgent = (updatedAgent: Agent) => {
    setAgents(agents.map(agent => 
      agent.id === updatedAgent.id ? updatedAgent : agent
    ));
  };

  const connectAgents = (sourceId: string, targetId: string) => {
    setAgents(agents.map(agent => {
      if (agent.id === sourceId && !agent.connections.includes(targetId)) {
        return { ...agent, connections: [...agent.connections, targetId] };
      }
      return agent;
    }));
  };

  const disconnectAgents = (sourceId: string, targetId: string) => {
    setAgents(agents.map(agent => {
      if (agent.id === sourceId) {
        return { ...agent, connections: agent.connections.filter(id => id !== targetId) };
      }
      return agent;
    }));
  };

  const deleteAgent = (agentId: string) => {
    setAgents(agents.filter(agent => agent.id !== agentId));
    if (selectedAgent?.id === agentId) {
      setSelectedAgent(null);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      <main className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Gestion des Agents IA</h1>
          <button
            onClick={addAgent}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg"
          >
            Ajouter un Agent
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Liste des agents */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Agents Disponibles</h2>
            <div className="space-y-4">
              {agents.map(agent => (
                <div
                  key={agent.id}
                  className={`p-4 border rounded-lg cursor-pointer ${
                    selectedAgent?.id === agent.id ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                  }`}
                  onClick={() => setSelectedAgent(agent)}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-medium">{agent.name}</h3>
                      <p className="text-sm text-gray-600">{agent.description}</p>
                      <div className="mt-2 flex gap-2">
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          agent.status === 'active' ? 'bg-green-100 text-green-800' :
                          agent.status === 'processing' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {agent.status}
                        </span>
                        <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
                          {agent.type}
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteAgent(agent.id);
                      }}
                      className="text-red-500 hover:text-red-700"
                    >
                      Supprimer
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Détails de l'agent sélectionné */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Détails de l'Agent</h2>
            {selectedAgent ? (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Nom</label>
                  <input
                    type="text"
                    value={selectedAgent.name}
                    onChange={(e) => updateAgent({ ...selectedAgent, name: e.target.value })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Description</label>
                  <textarea
                    value={selectedAgent.description}
                    onChange={(e) => updateAgent({ ...selectedAgent, description: e.target.value })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    rows={3}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Type</label>
                  <select
                    value={selectedAgent.type}
                    onChange={(e) => updateAgent({ ...selectedAgent, type: e.target.value as Agent['type'] })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  >
                    <option value="analyzer">Analyseur</option>
                    <option value="generator">Générateur</option>
                    <option value="processor">Processeur</option>
                    <option value="validator">Validateur</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Capacités</label>
                  <div className="mt-2 space-y-2">
                    {selectedAgent.capabilities.map((capability, index) => (
                      <div key={index} className="flex items-center">
                        <input
                          type="text"
                          value={capability}
                          onChange={(e) => {
                            const newCapabilities = [...selectedAgent.capabilities];
                            newCapabilities[index] = e.target.value;
                            updateAgent({ ...selectedAgent, capabilities: newCapabilities });
                          }}
                          className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        />
                        <button
                          onClick={() => {
                            const newCapabilities = selectedAgent.capabilities.filter((_, i) => i !== index);
                            updateAgent({ ...selectedAgent, capabilities: newCapabilities });
                          }}
                          className="ml-2 text-red-500 hover:text-red-700"
                        >
                          Supprimer
                        </button>
                      </div>
                    ))}
                    <button
                      onClick={() => updateAgent({ ...selectedAgent, capabilities: [...selectedAgent.capabilities, ''] })}
                      className="text-blue-500 hover:text-blue-700"
                    >
                      + Ajouter une capacité
                    </button>
                  </div>
                </div>

                {/* Configuration de l'agent */}
                <div className="mt-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Configuration</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Modèle</label>
                      <input
                        type="text"
                        value={selectedAgent.config?.model || ''}
                        onChange={(e) => updateAgent({
                          ...selectedAgent,
                          config: { ...selectedAgent.config, model: e.target.value }
                        })}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Température</label>
                      <input
                        type="number"
                        step="0.1"
                        min="0"
                        max="2"
                        value={selectedAgent.config?.temperature || 0.7}
                        onChange={(e) => updateAgent({
                          ...selectedAgent,
                          config: { ...selectedAgent.config, temperature: parseFloat(e.target.value) }
                        })}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Tokens Maximum</label>
                      <input
                        type="number"
                        value={selectedAgent.config?.maxTokens || 1000}
                        onChange={(e) => updateAgent({
                          ...selectedAgent,
                          config: { ...selectedAgent.config, maxTokens: parseInt(e.target.value) }
                        })}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                </div>

                {/* Connexions entre agents */}
                <AgentConnections
                  agents={agents}
                  selectedAgent={selectedAgent}
                  onConnect={connectAgents}
                  onDisconnect={disconnectAgents}
                />
              </div>
            ) : (
              <p className="text-gray-500">Sélectionnez un agent pour voir ses détails</p>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default IAAgentsPage; 