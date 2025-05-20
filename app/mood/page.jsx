'use client';

import { useState, useEffect } from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { FiPlusCircle } from 'react-icons/fi';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

export default function MoodTracker() {
  const [moodEntries, setMoodEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newMood, setNewMood] = useState(3);
  const [newNote, setNewNote] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchMoodEntries();
  }, []);

  const fetchMoodEntries = async () => {
    try {
      const response = await fetch('/api/mood');
      const data = await response.json();
      setMoodEntries(data);
    } catch (error) {
      console.error('Failed to fetch mood entries:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddMoodEntry = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const response = await fetch('/api/mood', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          mood: newMood,
          note: newNote,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to add mood entry');
      }

      const newEntry = await response.json();
      setMoodEntries([newEntry, ...moodEntries]);
      setShowAddModal(false);
      setNewMood(3);
      setNewNote('');
    } catch (error) {
      console.error('Error adding mood entry:', error);
    } finally {
      setSubmitting(false);
    }
  };

  // Prepare chart data
  const chartData = {
    labels: moodEntries
      .slice(0, 14)
      .reverse()
      .map(entry => {
        const date = new Date(entry.createdAt);
        return `${date.getMonth() + 1}/${date.getDate()}`;
      }),
    datasets: [
      {
        label: 'Mood',
        data: moodEntries
          .slice(0, 14)
          .reverse()
          .map(entry => entry.mood),
        fill: false,
        backgroundColor: 'rgb(59, 130, 246)',
        borderColor: 'rgba(59, 130, 246, 0.6)',
        tension: 0.1,
      },
    ],
  };

  const chartOptions = {
    scales: {
      y: {
        min: 1,
        max: 5,
        ticks: {
          stepSize: 1,
          callback: function(value) {
            const labels = {
              1: 'Very poor',
              2: 'Poor',
              3: 'Neutral',
              4: 'Good',
              5: 'Excellent'
            };
            return labels[value] || value;
          }
        }
      }
    },
    plugins: {
      legend: {
        display: false,
      },
    },
    responsive: true,
    maintainAspectRatio: false,
  };

  const getMoodLabel = (mood) => {
    const labels = {
      1: 'Very poor',
      2: 'Poor',
      3: 'Neutral',
      4: 'Good',
      5: 'Excellent'
    };
    return labels[mood] || 'Unknown';
  };

  return (
    <div>
      <div className="mb-6 flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Mood Tracker</h1>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          <FiPlusCircle />
          <span>Add Entry</span>
        </button>
      </div>

      {/* Chart */}
      <div className="bg-white p-6 rounded-lg shadow mb-6">
        <h2 className="text-lg font-medium mb-4">Mood History</h2>
        <div className="h-64">
          {loading ? (
            <div className="h-full flex justify-center items-center">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          ) : moodEntries.length > 0 ? (
            <Line data={chartData} options={chartOptions} />
          ) : (
            <div className="h-full flex justify-center items-center">
              <p className="text-gray-500">No mood entries yet</p>
            </div>
          )}
        </div>
      </div>

      {/* Entry List */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-lg font-medium mb-4">Recent Entries</h2>
        {loading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : moodEntries.length > 0 ? (
          <div className="space-y-4">
            {moodEntries.map(entry => (
              <div key={entry.id} className="border rounded-lg p-4">
                <div className="flex justify-between mb-2">
                  <div>
                    <span className="font-medium">{getMoodLabel(entry.mood)}</span>
                    <span className="ml-2 text-sm text-gray-500">
                      {new Date(entry.createdAt).toLocaleString()}
                    </span>
                  </div>
                  <div className="flex items-center">
                    {[1, 2, 3, 4, 5].map(m => (
                      <div
                        key={m}
                        className={`w-4 h-4 mx-0.5 rounded-full ${
                          m <= entry.mood ? 'bg-blue-500' : 'bg-gray-200'
                        }`}
                      />
                    ))}
                  </div>
                </div>
                {entry.note && <p className="text-gray-700">{entry.note}</p>}
              </div>
            ))}
          </div>
        ) : (
          <div className="py-8 text-center">
            <p className="text-gray-500">No mood entries yet</p>
          </div>
        )}
      </div>

      {/* Add Mood Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-lg w-full">
            <div className="p-6">
              <h2 className="text-xl font-bold mb-4">Add Mood Entry</h2>
              <form onSubmit={handleAddMoodEntry}>
                <div className="mb-4">
                  <label className="block text-gray-700 mb-2">How are you feeling?</label>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm text-gray-500">Very poor</span>
                    <span className="text-sm text-gray-500">Excellent</span>
                  </div>
                  <input 
                    type="range" 
                    min="1" 
                    max="5" 
                    value={newMood} 
                    onChange={(e) => setNewMood(parseInt(e.target.value))}
                    className="w-full"
                  />
                  <div className="text-center mt-2 font-medium">
                    {getMoodLabel(newMood)}
                  </div>
                </div>
                <div className="mb-4">
                  <label className="block text-gray-700 mb-2">Notes (optional)</label>
                  <textarea
                    value={newNote}
                    onChange={(e) => setNewNote(e.target.value)}
                    className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows="3"
                    placeholder="Add some notes about how you're feeling..."
                  ></textarea>
                </div>
                <div className="flex justify-end space-x-2">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="px-4 py-2 border rounded-lg text-gray-700 hover:bg-gray-50"
                    disabled={submitting}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-blue-400"
                    disabled={submitting}
                  >
                    {submitting ? 'Saving...' : 'Save Entry'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}