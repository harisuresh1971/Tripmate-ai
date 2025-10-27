import React from 'react';
import type { Trip } from '../types';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { PieChartIcon } from './icons';

interface BudgetTrackerProps {
  trip: Trip | null;
}

const COLORS = ['#00A8A8', '#6EE7B7', '#94D2BD', '#005F73', '#FBBF24', '#F59E0B'];

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-black/40 backdrop-blur-md p-2 border border-white/10 rounded-lg text-white">
        <p className="label">{`${payload[0].name} : ₹${payload[0].value.toLocaleString()}`}</p>
      </div>
    );
  }
  return null;
};

const BudgetTracker: React.FC<BudgetTrackerProps> = ({ trip }) => {
  if (!trip) {
    return (
      <div className="flex flex-col items-center justify-center text-center p-8 bg-black/20 backdrop-blur-xl border border-white/10 rounded-3xl">
        <PieChartIcon className="w-24 h-24 text-primary mb-4" />
        <h2 className="text-2xl font-bold text-white mb-2">Budget Tracker</h2>
        <p className="text-gray-400">
          Plan a trip first to see your budget breakdown here.
        </p>
      </div>
    );
  }

  const expenseData = trip.itinerary
    .flatMap(day => day.activities)
    .filter(activity => activity.estimated_cost > 0)
    .reduce((acc, activity) => {
        const category = activity.type || 'Miscellaneous';
        const existing = acc.find(item => item.name === category);
        if(existing) {
            existing.value += activity.estimated_cost;
        } else {
            acc.push({ name: category, value: activity.estimated_cost });
        }
        return acc;
    }, [] as {name: string, value: number}[]);

    const budgetRemaining = trip.budget - trip.total_cost;

  return (
    <div className="bg-black/20 backdrop-blur-xl border border-white/10 rounded-3xl p-4 sm:p-6">
      <h2 className="text-2xl font-bold text-primary-light mb-4">Budget for {trip.destination}</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
            <div>
                 <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                    <Pie
                        data={expenseData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={100}
                        innerRadius={60}
                        fill="#8884d8"
                        dataKey="value"
                        nameKey="name"
                        paddingAngle={5}
                    >
                        {expenseData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke={COLORS[index % COLORS.length]} />
                        ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                    <Legend iconType="circle" />
                    </PieChart>
                </ResponsiveContainer>
            </div>
            <div className="space-y-4 text-center md:text-left">
                <div>
                    <p className="text-sm text-gray-400">Total Budget</p>
                    <p className="text-2xl font-bold text-white">₹{trip.budget.toLocaleString()}</p>
                </div>
                 <div>
                    <p className="text-sm text-gray-400">Estimated Expenses</p>
                    <p className="text-2xl font-bold text-red-400">₹{trip.total_cost.toLocaleString()}</p>
                </div>
                 <div>
                    <p className="text-sm text-gray-400">Remaining</p>
                    <p className={`text-2xl font-bold ${budgetRemaining >= 0 ? 'text-green-400' : 'text-orange-400'}`}>
                        ₹{budgetRemaining.toLocaleString()}
                    </p>
                </div>
            </div>
        </div>
    </div>
  );
};

export default BudgetTracker;
