'use client';

import { motion } from "framer-motion";
import { useUser } from "@/context/UserContext";
import { useState, useEffect } from "react";
import {
  CreditCardIcon,
  BanknotesIcon,
  StarIcon,
  CheckIcon,
  BoltIcon,
  ArrowUpIcon
} from "@heroicons/react/24/outline";

export default function Billing() {
  const { user, isLoading } = useUser();
  const [billingData, setBillingData] = useState(null);
  const [loadingData, setLoadingData] = useState(true);

  const plans = [
    {
      id: 'free',
      name: 'Free',
      price: 0,
      period: 'month',
      features: [
        '5 interviews per month',
        '10 practice sessions',
        'Basic AI feedback',
        'Community support',
        '10 credits per month'
      ],
      color: 'gray',
      popular: false
    },
    {
      id: 'pro',
      name: 'Pro',
      price: 19,
      period: 'month',
      features: [
        '50 interviews per month',
        '100 practice sessions',
        'Advanced AI feedback',
        'Email support',
        '100 credits per month',
        'Custom questions',
        'Priority support'
      ],
      color: 'blue',
      popular: true
    },
    {
      id: 'enterprise',
      name: 'Enterprise',
      price: 99,
      period: 'month',
      features: [
        'Unlimited interviews',
        'Unlimited practice sessions',
        'Enterprise AI feedback',
        'Dedicated support',
        '500 credits per month',
        'Team management',
        'API access',
        'Custom integrations'
      ],
      color: 'purple',
      popular: false
    }
  ];

  useEffect(() => {
    const fetchBillingData = async () => {
      if (!user?.email) return;
      
      try {
        setLoadingData(true);
        const response = await fetch(`/api/billing?userEmail=${encodeURIComponent(user.email)}`);
        
        if (response.ok) {
          const data = await response.json();
          setBillingData(data);
        } else {
          console.error('Error fetching billing data');
        }
      } catch (error) {
        console.error('Error fetching billing data:', error);
      } finally {
        setLoadingData(false);
      }
    };

    fetchBillingData();
  }, [user]);

  const upgradePlan = async (planId) => {
    try {
      const response = await fetch('/api/billing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userEmail: user.email,
          action: 'updateSubscription',
          tier: planId,
          expires_at: planId === 'free' ? null : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
        })
      });

      if (response.ok) {
        window.location.reload();
      }
    } catch (error) {
      console.error('Error upgrading plan:', error);
    }
  };

  const addCredits = async (amount) => {
    try {
      const response = await fetch('/api/billing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userEmail: user.email,
          action: 'addCredits',
          credits: amount
        })
      });

      if (response.ok) {
        window.location.reload();
      }
    } catch (error) {
      console.error('Error adding credits:', error);
    }
  };

  const getColorClasses = (color) => {
    const colors = {
      gray: 'from-gray-600/20 to-gray-800/20 border-gray-500/30',
      blue: 'from-blue-600/20 to-blue-800/20 border-blue-500/30',
      purple: 'from-purple-600/20 to-purple-800/20 border-purple-500/30'
    };
    return colors[color] || colors.gray;
  };

  if (isLoading || loadingData) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white">Billing & Subscription</h1>
        <p className="text-gray-400 mt-2">Manage your subscription and billing preferences</p>
      </div>

      {/* Current Plan */}
      {billingData && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gray-800/50 backdrop-blur-lg rounded-xl p-6 border border-gray-700/50"
        >
          <h2 className="text-xl font-semibold mb-4 flex items-center">
            <CreditCardIcon className="h-6 w-6 mr-2 text-blue-400" />
            Current Plan
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-400 capitalize">
                {billingData.subscription_tier}
              </div>
              <div className="text-gray-400">Current Plan</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-400">
                {billingData.credits}
              </div>
              <div className="text-gray-400">Credits Remaining</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-400">
                {billingData.subscription_expires_at 
                  ? new Date(billingData.subscription_expires_at).toLocaleDateString()
                  : 'Never'}
              </div>
              <div className="text-gray-400">Next Billing</div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Plans */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-gray-800/50 backdrop-blur-lg rounded-xl p-6 border border-gray-700/50"
      >
        <h2 className="text-xl font-semibold mb-6 flex items-center">
          <StarIcon className="h-6 w-6 mr-2 text-purple-400" />
          Subscription Plans
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {plans.map((plan) => (
            <div
              key={plan.id}
              className={`relative rounded-xl p-6 border backdrop-blur-lg bg-gradient-to-br ${getColorClasses(plan.color)}`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-1 rounded-full text-sm font-medium">
                    Most Popular
                  </div>
                </div>
              )}
              
              <div className="text-center mb-6">
                <h3 className="text-xl font-bold text-white">{plan.name}</h3>
                <div className="mt-2">
                  <span className="text-3xl font-bold text-white">${plan.price}</span>
                  <span className="text-gray-400">/{plan.period}</span>
                </div>
              </div>
              
              <ul className="space-y-3 mb-6">
                {plan.features.map((feature, index) => (
                  <li key={index} className="flex items-center text-gray-300">
                    <CheckIcon className="h-4 w-4 text-green-400 mr-2 flex-shrink-0" />
                    {feature}
                  </li>
                ))}
              </ul>
              
              <button
                onClick={() => upgradePlan(plan.id)}
                disabled={billingData?.subscription_tier === plan.id}
                className={`w-full py-3 px-4 rounded-lg font-medium transition-all ${
                  billingData?.subscription_tier === plan.id
                    ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                    : 'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:shadow-lg'
                }`}
              >
                {billingData?.subscription_tier === plan.id ? 'Current Plan' : `Upgrade to ${plan.name}`}
              </button>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Credits */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-gray-800/50 backdrop-blur-lg rounded-xl p-6 border border-gray-700/50"
      >
        <h2 className="text-xl font-semibold mb-6 flex items-center">
          <BanknotesIcon className="h-6 w-6 mr-2 text-yellow-400" />
          Buy Additional Credits
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[
            { amount: 10, price: 5, bonus: 0 },
            { amount: 25, price: 10, bonus: 5 },
            { amount: 50, price: 20, bonus: 15 },
            { amount: 100, price: 35, bonus: 35 }
          ].map((option) => (
            <div
              key={option.amount}
              className="bg-gray-700/30 rounded-lg p-4 border border-gray-600/30 text-center"
            >
              <div className="text-2xl font-bold text-yellow-400">
                {option.amount + option.bonus}
              </div>
              <div className="text-gray-400 text-sm">credits</div>
              {option.bonus > 0 && (
                <div className="text-green-400 text-sm">
                  +{option.bonus} bonus
                </div>
              )}
              <div className="text-lg font-semibold text-white mt-2">
                ${option.price}
              </div>
              <button
                onClick={() => addCredits(option.amount + option.bonus)}
                className="w-full mt-3 py-2 px-4 bg-yellow-600 hover:bg-yellow-700 rounded-lg text-white font-medium transition-colors"
              >
                Buy Now
              </button>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Usage Stats */}
      {billingData?.billing_info && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-gray-800/50 backdrop-blur-lg rounded-xl p-6 border border-gray-700/50"
        >
          <h2 className="text-xl font-semibold mb-6 flex items-center">
            <BoltIcon className="h-6 w-6 mr-2 text-green-400" />
            Plan Features
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {Object.entries(billingData.billing_info.features).map(([key, value]) => (
              <div key={key} className="text-center p-4 bg-gray-700/30 rounded-lg">
                <div className="text-lg font-semibold text-white capitalize">
                  {key.replace(/_/g, ' ')}
                </div>
                <div className="text-gray-400">
                  {typeof value === 'boolean' ? (value ? 'Included' : 'Not included') : 
                   value === -1 ? 'Unlimited' : value}
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
}
