'use client'

import { useState, useEffect } from 'react'
import { ArrowUpRight, ArrowDownLeft, CreditCard, LogOut, TrendingUp, TrendingDown, Eye, EyeOff, Plus, Minus, BarChart3, PieChart, Calendar, Filter } from 'lucide-react'
import { LineChart, Line, AreaChart, Area, BarChart, Bar, PieChart as RechartsPieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import Logo from './Logo'
import DepositModal from './DepositModal'
import WithdrawModal from './WithdrawModal'
import { useToastContext } from '@/contexts/ToastContext'

export default function DashboardClient({ user, wallet, transactions, payments }: any) {
  const [activeTab, setActiveTab] = useState('overview')
  const [showBalance, setShowBalance] = useState(true)
  const [timeRange, setTimeRange] = useState('7d')
  const [showDepositModal, setShowDepositModal] = useState(false)
  const [showWithdrawModal, setShowWithdrawModal] = useState(false)

  const toast = useToastContext()

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search)
    const depositStatus = urlParams.get('deposit')
    const authStatus = urlParams.get('auth')
    const sessionId = urlParams.get('session_id')
    
    if (authStatus === 'success') {
      toast.success('Connexion réussie !', `Bienvenue ${user.name || user.email}`)
      window.history.replaceState({}, '', '/dashboard')
    } else if (depositStatus === 'success' && sessionId) {
      toast.success('Dépôt réussi !', 'Votre paiement a été traité avec succès')
      window.history.replaceState({}, '', '/dashboard')
    } else if (depositStatus === 'cancelled') {
      toast.warning('Paiement annulé', 'Votre paiement a été annulé')
      window.history.replaceState({}, '', '/dashboard')
    }
  }, [])

  const handleTransactionSuccess = () => {
    toast.success('Opération réussie !', 'Votre transaction a été traitée avec succès')
    setTimeout(() => window.location.reload(), 1000)
  }

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XAF'
    }).format(amount)
  }

  // Données simulées pour les graphiques
  const chartData = [
    { name: 'Jan', revenus: 4000, depenses: 2400, solde: 1600 },
    { name: 'Fév', revenus: 3000, depenses: 1398, solde: 2602 },
    { name: 'Mar', revenus: 2000, depenses: 9800, solde: -7800 },
    { name: 'Avr', revenus: 2780, depenses: 3908, solde: -1128 },
    { name: 'Mai', revenus: 1890, depenses: 4800, solde: -2910 },
    { name: 'Jun', revenus: 2390, depenses: 3800, solde: -1410 },
    { name: 'Jul', revenus: 3490, depenses: 4300, solde: -810 }
  ]

  const pieData = [
    { name: 'Dépôts', value: 65, color: '#10B981' },
    { name: 'Retraits', value: 25, color: '#EF4444' },
    { name: 'Paiements', value: 10, color: '#F59E0B' }
  ]

  const recentActivity = [
    { type: 'DEPOSIT', amount: 50000, description: 'Dépôt Stripe', time: '2h', status: 'completed' },
    { type: 'PAYMENT', amount: -15000, description: 'Paiement boutique', time: '4h', status: 'completed' },
    { type: 'WITHDRAWAL', amount: -25000, description: 'Retrait ATM', time: '1j', status: 'pending' },
    { type: 'DEPOSIT', amount: 100000, description: 'Virement bancaire', time: '2j', status: 'completed' }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Navigation */}
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <Logo size="md" />
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-r from-green-400 to-green-600 rounded-full flex items-center justify-center text-white text-sm font-medium">
                  {user.name?.charAt(0)}
                </div>
                <div className="hidden md:block">
                  <p className="text-sm font-medium text-gray-900">{user.name}</p>
                  <p className="text-xs text-gray-500 capitalize">{user.userType}</p>
                </div>
              </div>
              <button
                onClick={() => {
                  fetch('/api/auth/logout', { method: 'POST' })
                    .then(() => window.location.href = '/auth/signin')
                }}
                className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <LogOut className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {/* Header avec solde principal */}
          <div className="mb-8">
            <div className="bg-gradient-to-r from-green-600 to-green-700 rounded-2xl p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-100 text-sm">Solde total</p>
                  <div className="flex items-center space-x-2">
                    <h1 className="text-3xl font-bold">
                      {showBalance ? formatAmount(wallet?.balance || 0) : '••••••'}
                    </h1>
                    <button
                      onClick={() => setShowBalance(!showBalance)}
                      className="p-1 hover:bg-green-500 rounded"
                    >
                      {showBalance ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  <p className="text-green-100 text-sm mt-1">+2.5% ce mois</p>
                </div>
                <div className="flex space-x-2">
                  <button 
                    onClick={() => setShowDepositModal(true)}
                    className="bg-white bg-opacity-20 hover:bg-opacity-30 px-4 py-2 rounded-lg flex items-center space-x-2 transition-all"
                  >
                    <Plus className="h-4 w-4" />
                    <span className="text-sm">Déposer</span>
                  </button>
                  <button 
                    onClick={() => setShowWithdrawModal(true)}
                    className="bg-white bg-opacity-20 hover:bg-opacity-30 px-4 py-2 rounded-lg flex items-center space-x-2 transition-all"
                  >
                    <Minus className="h-4 w-4" />
                    <span className="text-sm">Retirer</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Statistiques rapides */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Revenus ce mois</p>
                  <p className="text-2xl font-bold text-gray-900">125,000 FCFA</p>
                  <div className="flex items-center mt-1">
                    <TrendingUp className="h-4 w-4 text-green-500" />
                    <span className="text-sm text-green-600 ml-1">+12%</span>
                  </div>
                </div>
                <div className="p-3 bg-green-100 rounded-lg">
                  <ArrowDownLeft className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Dépenses ce mois</p>
                  <p className="text-2xl font-bold text-gray-900">89,500 FCFA</p>
                  <div className="flex items-center mt-1">
                    <TrendingDown className="h-4 w-4 text-red-500" />
                    <span className="text-sm text-red-600 ml-1">-5%</span>
                  </div>
                </div>
                <div className="p-3 bg-red-100 rounded-lg">
                  <ArrowUpRight className="h-6 w-6 text-red-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Transactions</p>
                  <p className="text-2xl font-bold text-gray-900">{transactions?.length || 0}</p>
                  <div className="flex items-center mt-1">
                    <TrendingUp className="h-4 w-4 text-blue-500" />
                    <span className="text-sm text-blue-600 ml-1">+8%</span>
                  </div>
                </div>
                <div className="p-3 bg-blue-100 rounded-lg">
                  <BarChart3 className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Paiements</p>
                  <p className="text-2xl font-bold text-gray-900">{payments?.length || 0}</p>
                  <div className="flex items-center mt-1">
                    <TrendingUp className="h-4 w-4 text-purple-500" />
                    <span className="text-sm text-purple-600 ml-1">+15%</span>
                  </div>
                </div>
                <div className="p-3 bg-purple-100 rounded-lg">
                  <CreditCard className="h-6 w-6 text-purple-600" />
                </div>
              </div>
            </div>
          </div>

          {/* Navigation des onglets */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 mb-6">
            <div className="border-b border-gray-200">
              <nav className="flex space-x-8 px-6" aria-label="Tabs">
                {[
                  { id: 'overview', name: 'Vue d\'ensemble', icon: BarChart3 },
                  { id: 'analytics', name: 'Analyses', icon: TrendingUp },
                  { id: 'transactions', name: 'Transactions', icon: CreditCard },
                  { id: 'operations', name: 'Opérations', icon: Plus }
                ].map((tab) => {
                  const Icon = tab.icon
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`${
                        activeTab === tab.id
                          ? 'border-green-500 text-green-600'
                          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 transition-colors`}
                    >
                      <Icon className="h-4 w-4" />
                      <span>{tab.name}</span>
                    </button>
                  )
                })}
              </nav>
            </div>

            <div className="p-6">
              {activeTab === 'overview' && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Graphique des tendances */}
                    <div className="bg-gray-50 rounded-lg p-4">
                      <h3 className="text-lg font-semibold mb-4">Évolution du solde</h3>
                      <ResponsiveContainer width="100%" height={300}>
                        <AreaChart data={chartData}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="name" />
                          <YAxis />
                          <Tooltip formatter={(value) => formatAmount(value as number)} />
                          <Area type="monotone" dataKey="solde" stroke="#10B981" fill="#10B981" fillOpacity={0.3} />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>

                    {/* Répartition des transactions */}
                    <div className="bg-gray-50 rounded-lg p-4">
                      <h3 className="text-lg font-semibold mb-4">Répartition des transactions</h3>
                      <ResponsiveContainer width="100%" height={300}>
                        <RechartsPieChart>
                          <Pie
                            data={pieData}
                            cx="50%"
                            cy="50%"
                            outerRadius={80}
                            dataKey="value"
                          >
                            {pieData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip />
                          <Legend />
                        </RechartsPieChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  {/* Activité récente */}
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Activité récente</h3>
                    <div className="space-y-3">
                      {recentActivity.map((activity, index) => (
                        <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                          <div className="flex items-center space-x-3">
                            <div className={`p-2 rounded-full ${
                              activity.type === 'DEPOSIT' ? 'bg-green-100' :
                              activity.type === 'WITHDRAWAL' ? 'bg-red-100' : 'bg-blue-100'
                            }`}>
                              {activity.type === 'DEPOSIT' ? (
                                <ArrowDownLeft className={`h-4 w-4 ${
                                  activity.type === 'DEPOSIT' ? 'text-green-600' : ''
                                }`} />
                              ) : activity.type === 'WITHDRAWAL' ? (
                                <ArrowUpRight className="h-4 w-4 text-red-600" />
                              ) : (
                                <CreditCard className="h-4 w-4 text-blue-600" />
                              )}
                            </div>
                            <div>
                              <p className="font-medium text-gray-900">{activity.description}</p>
                              <p className="text-sm text-gray-500">Il y a {activity.time}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className={`font-semibold ${
                              activity.amount > 0 ? 'text-green-600' : 'text-red-600'
                            }`}>
                              {activity.amount > 0 ? '+' : ''}{formatAmount(Math.abs(activity.amount))}
                            </p>
                            <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                              activity.status === 'completed' 
                                ? 'bg-green-100 text-green-800'
                                : 'bg-yellow-100 text-yellow-800'
                            }`}>
                              {activity.status === 'completed' ? 'Terminé' : 'En cours'}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'analytics' && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold">Analyses financières</h3>
                    <div className="flex items-center space-x-2">
                      <select 
                        value={timeRange} 
                        onChange={(e) => setTimeRange(e.target.value)}
                        className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
                      >
                        <option value="7d">7 derniers jours</option>
                        <option value="30d">30 derniers jours</option>
                        <option value="90d">3 derniers mois</option>
                        <option value="1y">1 an</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="bg-gray-50 rounded-lg p-4">
                      <h4 className="font-semibold mb-4">Revenus vs Dépenses</h4>
                      <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={chartData}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="name" />
                          <YAxis />
                          <Tooltip formatter={(value) => formatAmount(value as number)} />
                          <Legend />
                          <Bar dataKey="revenus" fill="#10B981" name="Revenus" />
                          <Bar dataKey="depenses" fill="#EF4444" name="Dépenses" />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>

                    <div className="bg-gray-50 rounded-lg p-4">
                      <h4 className="font-semibold mb-4">Tendance du solde</h4>
                      <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={chartData}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="name" />
                          <YAxis />
                          <Tooltip formatter={(value) => formatAmount(value as number)} />
                          <Line type="monotone" dataKey="solde" stroke="#8B5CF6" strokeWidth={3} />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'transactions' && (
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-semibold">Historique des transactions</h3>
                    <button className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                      <Filter className="h-4 w-4" />
                      <span>Filtrer</span>
                    </button>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Type
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Description
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Montant
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Date
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Statut
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {transactions?.map((transaction: any) => (
                          <tr key={transaction.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                                transaction.type === 'DEPOSIT' ? 'bg-green-100 text-green-800' :
                                transaction.type === 'WITHDRAWAL' ? 'bg-red-100 text-red-800' :
                                'bg-blue-100 text-blue-800'
                              }`}>
                                {transaction.type}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {transaction.description}
                            </td>
                            <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${
                              transaction.amount > 0 ? 'text-green-600' : 'text-red-600'
                            }`}>
                              {transaction.amount > 0 ? '+' : ''}{formatAmount(Math.abs(transaction.amount))}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {new Date(transaction.createdAt).toLocaleDateString('fr-FR')}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                                transaction.status === 'COMPLETED' 
                                  ? 'bg-green-100 text-green-800'
                                  : transaction.status === 'PENDING'
                                  ? 'bg-yellow-100 text-yellow-800'
                                  : 'bg-red-100 text-red-800'
                              }`}>
                                {transaction.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {activeTab === 'operations' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Dépôt */}
                  <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-6 border border-green-200">
                    <div className="flex items-center space-x-3 mb-4">
                      <div className="p-3 bg-green-500 rounded-lg">
                        <Plus className="h-6 w-6 text-white" />
                      </div>
                      <h3 className="text-lg font-semibold text-green-800">Effectuer un dépôt</h3>
                    </div>
                    <p className="text-green-700 mb-4">Ajoutez des fonds à votre wallet via différents agrégateurs de paiement</p>
                    <button 
                      onClick={() => setShowDepositModal(true)}
                      className="w-full bg-green-600 hover:bg-green-700 text-white py-3 px-4 rounded-lg font-medium transition-colors flex items-center justify-center space-x-2"
                    >
                      <Plus className="h-4 w-4" />
                      <span>Déposer maintenant</span>
                    </button>
                  </div>

                  {/* Retrait */}
                  <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-xl p-6 border border-red-200">
                    <div className="flex items-center space-x-3 mb-4">
                      <div className="p-3 bg-red-500 rounded-lg">
                        <Minus className="h-6 w-6 text-white" />
                      </div>
                      <h3 className="text-lg font-semibold text-red-800">Effectuer un retrait</h3>
                    </div>
                    <p className="text-red-700 mb-2">Retirez vos fonds vers votre compte bancaire ou mobile money</p>
                    <p className="text-sm text-red-600 mb-4">
                      Solde disponible: {formatAmount(wallet?.balance || 0)}
                    </p>
                    <button 
                      onClick={() => setShowWithdrawModal(true)}
                      className="w-full bg-red-600 hover:bg-red-700 text-white py-3 px-4 rounded-lg font-medium transition-colors flex items-center justify-center space-x-2"
                    >
                      <Minus className="h-4 w-4" />
                      <span>Retirer maintenant</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      <DepositModal 
        isOpen={showDepositModal}
        onClose={() => setShowDepositModal(false)}
        onSuccess={handleTransactionSuccess}
      />
      
      <WithdrawModal 
        isOpen={showWithdrawModal}
        onClose={() => setShowWithdrawModal(false)}
        onSuccess={handleTransactionSuccess}
        availableBalance={wallet?.balance || 0}
      />
    </div>
  )
}