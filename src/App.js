// App.jsx
import React, { useState, useEffect } from 'react';
import { Calendar, Coffee, Sun, Moon, DollarSign, Plus, Trash2, Download } from 'lucide-react';

export default function TiffinTracker() {
  const [meals, setMeals] = useState([]);
  const [mealPrice, setMealPrice] = useState({ morning: 0, evening: 0 });
  const [showPriceModal, setShowPriceModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedMealType, setSelectedMealType] = useState({ morning: false, evening: false });
  const [advanceGiven, setAdvanceGiven] = useState(0);
  const [showAdvanceModal, setShowAdvanceModal] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('tiffinMeals');
    const savedPrices = localStorage.getItem('mealPrices');
    const savedAdvance = localStorage.getItem('advanceGiven');
    if (saved) setMeals(JSON.parse(saved));
    if (savedPrices) setMealPrice(JSON.parse(savedPrices));
    else setShowPriceModal(true);
    if (savedAdvance) setAdvanceGiven(parseFloat(savedAdvance));
  }, []);

  useEffect(() => {
    localStorage.setItem('tiffinMeals', JSON.stringify(meals));
  }, [meals]);

  useEffect(() => {
    localStorage.setItem('mealPrices', JSON.stringify(mealPrice));
  }, [mealPrice]);

  useEffect(() => {
    localStorage.setItem('advanceGiven', advanceGiven.toString());
  }, [advanceGiven]);

  const addMeal = () => {
    if (!selectedMealType.morning && !selectedMealType.evening) {
      alert('Please select at least one meal type');
      return;
    }

    const newMeals = [];
    if (selectedMealType.morning) {
      newMeals.push({
        id: Date.now() + '-morning',
        date: selectedDate,
        type: 'morning',
        price: mealPrice.morning
      });
    }
    if (selectedMealType.evening) {
      newMeals.push({
        id: Date.now() + '-evening',
        date: selectedDate,
        type: 'evening',
        price: mealPrice.evening
      });
    }

    setMeals([...meals, ...newMeals].sort((a, b) => new Date(b.date) - new Date(a.date)));
    setSelectedMealType({ morning: false, evening: false });
  };

  const deleteMeal = (id) => {
    setMeals(meals.filter(m => m.id !== id));
  };

  const savePrices = (morning, evening) => {
    setMealPrice({ morning: parseFloat(morning) || 0, evening: parseFloat(evening) || 0 });
    setShowPriceModal(false);
  };

  const getTotalCost = () => {
    return meals.reduce((sum, meal) => sum + meal.price, 0);
  };

  const getRemainingBalance = () => {
    return advanceGiven - getTotalCost();
  };

  const getMealsByMonth = () => {
    const grouped = {};
    meals.forEach(meal => {
      const month = meal.date.substring(0, 7);
      if (!grouped[month]) grouped[month] = [];
      grouped[month].push(meal);
    });
    return grouped;
  };

  const getMonthTotal = (monthMeals) => {
    return monthMeals.reduce((sum, meal) => sum + meal.price, 0);
  };

  const exportData = () => {
    const data = meals.map(m => ({
      Date: m.date,
      Meal: m.type === 'morning' ? 'Morning' : 'Evening',
      Price: `₹${m.price}`
    }));
    const csv = [
      Object.keys(data[0]).join(','),
      ...data.map(row => Object.values(row).join(','))
    ].join('\n');
    
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `tiffin-records-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  const monthlyData = getMealsByMonth();
  const sortedMonths = Object.keys(monthlyData).sort().reverse();

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-yellow-50 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="bg-orange-500 p-3 rounded-xl">
                <Coffee className="text-white" size={28} />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-800">Tiffin Tracker</h1>
                <p className="text-sm text-gray-500">Track your daily meals</p>
              </div>
            </div>
            <button
              onClick={() => setShowPriceModal(true)}
              className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition flex items-center gap-2"
            >
              <DollarSign size={18} />
              Set Prices
            </button>
          </div>

          {/* Total Summary */}
          <div className="grid grid-cols-4 gap-4 mt-4">
            <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-xl">
              <p className="text-sm text-gray-600 mb-1">Total Meals</p>
              <p className="text-2xl font-bold text-green-700">{meals.length}</p>
            </div>
            <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-4 rounded-xl">
              <p className="text-sm text-gray-600 mb-1">Total Cost</p>
              <p className="text-2xl font-bold text-orange-700">₹{getTotalCost()}</p>
            </div>
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-xl cursor-pointer hover:shadow-md transition" onClick={() => setShowAdvanceModal(true)}>
              <p className="text-sm text-gray-600 mb-1">Advance Given</p>
              <p className="text-2xl font-bold text-blue-700">₹{advanceGiven}</p>
            </div>
            <div className={`bg-gradient-to-br ${getRemainingBalance() >= 0 ? 'from-purple-50 to-purple-100' : 'from-red-50 to-red-100'} p-4 rounded-xl`}>
              <p className="text-sm text-gray-600 mb-1">Balance</p>
              <p className={`text-2xl font-bold ${getRemainingBalance() >= 0 ? 'text-purple-700' : 'text-red-700'}`}>
                ₹{getRemainingBalance()}
              </p>
            </div>
          </div>
        </div>

        {/* Add Meal Section */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Plus size={20} />
            Add Meal Record
          </h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Date</label>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Meal Type</label>
              <div className="flex gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedMealType.morning}
                    onChange={(e) => setSelectedMealType({ ...selectedMealType, morning: e.target.checked })}
                    className="w-5 h-5 text-orange-500 rounded focus:ring-orange-500"
                  />
                  <Sun className="text-yellow-500" size={20} />
                  <span>Morning (₹{mealPrice.morning})</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedMealType.evening}
                    onChange={(e) => setSelectedMealType({ ...selectedMealType, evening: e.target.checked })}
                    className="w-5 h-5 text-orange-500 rounded focus:ring-orange-500"
                  />
                  <Moon className="text-indigo-500" size={20} />
                  <span>Evening (₹{mealPrice.evening})</span>
                </label>
              </div>
            </div>
            <button
              onClick={addMeal}
              className="w-full bg-orange-500 text-white py-3 rounded-lg hover:bg-orange-600 transition font-medium"
            >
              Add Meal
            </button>
          </div>
        </div>

        {/* Monthly Records */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <Calendar size={20} />
              Meal Records
            </h2>
            {meals.length > 0 && (
              <button
                onClick={exportData}
                className="text-sm bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition flex items-center gap-2"
              >
                <Download size={16} />
                Export CSV
              </button>
            )}
          </div>

          {meals.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <Coffee size={48} className="mx-auto mb-3 opacity-50" />
              <p>No meals recorded yet</p>
            </div>
          ) : (
            <div className="space-y-6">
              {sortedMonths.map(month => (
                <div key={month} className="border-b pb-4 last:border-b-0">
                  <div className="flex justify-between items-center mb-3">
                    <h3 className="font-semibold text-gray-700">
                      {new Date(month + '-01').toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                    </h3>
                    <span className="text-sm font-medium bg-orange-100 text-orange-700 px-3 py-1 rounded-full">
                      ₹{getMonthTotal(monthlyData[month])}
                    </span>
                  </div>
                  <div className="space-y-2">
                    {monthlyData[month].map(meal => (
                      <div key={meal.id} className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
                        <div className="flex items-center gap-3">
                          {meal.type === 'morning' ? (
                            <Sun className="text-yellow-500" size={20} />
                          ) : (
                            <Moon className="text-indigo-500" size={20} />
                          )}
                          <div>
                            <p className="font-medium text-gray-800">
                              {new Date(meal.date).toLocaleDateString('en-US', { 
                                day: 'numeric', 
                                month: 'short',
                                weekday: 'short'
                              })}
                            </p>
                            <p className="text-sm text-gray-500 capitalize">{meal.type}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="font-semibold text-gray-700">₹{meal.price}</span>
                          <button
                            onClick={() => deleteMeal(meal.id)}
                            className="text-red-500 hover:bg-red-50 p-2 rounded-lg transition"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Price Modal */}
      {showPriceModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full">
            <h3 className="text-xl font-bold mb-4">Set Meal Prices</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Morning Meal Price (₹)
                </label>
                <input
                  type="number"
                  defaultValue={mealPrice.morning}
                  id="morning-price"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  placeholder="e.g., 50"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Evening Meal Price (₹)
                </label>
                <input
                  type="number"
                  defaultValue={mealPrice.evening}
                  id="evening-price"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  placeholder="e.g., 60"
                />
              </div>
              <button
                onClick={() => {
                  const morning = document.getElementById('morning-price').value;
                  const evening = document.getElementById('evening-price').value;
                  savePrices(morning, evening);
                }}
                className="w-full bg-orange-500 text-white py-3 rounded-lg hover:bg-orange-600 transition font-medium"
              >
                Save Prices
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Advance Modal */}
      {showAdvanceModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full">
            <h3 className="text-xl font-bold mb-4">Update Advance Amount</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Advance Given (₹)
                </label>
                <input
                  type="number"
                  defaultValue={advanceGiven}
                  id="advance-amount"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., 1000"
                />
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    const amount = document.getElementById('advance-amount').value;
                    setAdvanceGiven(parseFloat(amount) || 0);
                    setShowAdvanceModal(false);
                  }}
                  className="flex-1 bg-blue-500 text-white py-3 rounded-lg hover:bg-blue-600 transition font-medium"
                >
                  Save
                </button>
                <button
                  onClick={() => setShowAdvanceModal(false)}
                  className="flex-1 bg-gray-300 text-gray-700 py-3 rounded-lg hover:bg-gray-400 transition font-medium"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}