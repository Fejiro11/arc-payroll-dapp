import React from 'react'
import { Link } from 'react-router-dom'
import { usePrivy } from '@privy-io/react-auth'
import { 
  Building2, 
  User,
  ArrowRight,
  Shield,
  Zap,
  TrendingUp,
  Github
} from 'lucide-react'

export default function LandingPage() {
  const { login, authenticated } = usePrivy()

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Header */}
      <header className="border-b border-gray-100 bg-white/80 backdrop-blur-sm fixed top-0 left-0 right-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">A</span>
              </div>
              <span className="font-semibold text-gray-900">Arc Payroll</span>
            </div>
            {!authenticated ? (
              <button
                onClick={login}
                className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors text-sm font-medium"
              >
                Sign In
              </button>
            ) : (
              <div className="flex items-center space-x-2">
                <Link
                  to="/business"
                  className="px-4 py-2 text-gray-600 hover:text-gray-900 text-sm font-medium"
                >
                  Dashboard
                </Link>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="pt-32 pb-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center space-x-2 px-3 py-1 bg-primary-50 text-primary-700 rounded-full text-sm font-medium mb-6">
            <span className="w-2 h-2 bg-primary-500 rounded-full animate-pulse"></span>
            <span>Live on Arc Testnet</span>
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight">
            Get paid. Stay flexible.{' '}
            <span className="text-primary-600">Decide later.</span>
          </h1>
          <p className="text-lg sm:text-xl text-gray-600 mb-4 max-w-2xl mx-auto">
            Arc Payroll gives employees the freedom to move between value preservation and yield, 
            whenever their priorities change.
          </p>
          <p className="text-xl sm:text-2xl font-medium text-gray-900 mb-10 italic">
            People change. So should how they get paid.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/business"
              className="w-full sm:w-auto flex items-center justify-center space-x-2 px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium"
            >
              <Building2 className="w-5 h-5" />
              <span>I'm an Employer</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              to="/staff/register"
              className="w-full sm:w-auto flex items-center justify-center space-x-2 px-6 py-3 bg-white text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium"
            >
              <User className="w-5 h-5" />
              <span>I'm an Employee</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 text-center mb-12">
            Why Arc Payroll?
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="p-6 bg-gray-50 rounded-xl">
              <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center mb-4">
                <Shield className="w-6 h-6 text-primary-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Private Preferences</h3>
              <p className="text-gray-600">
                Staff token preferences are completely hidden from employers. 
                Only the employee knows if they're receiving regular USD or yield-earning USYC.
              </p>
            </div>
            <div className="p-6 bg-gray-50 rounded-xl">
              <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center mb-4">
                <Zap className="w-6 h-6 text-primary-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Batch Payments</h3>
              <p className="text-gray-600">
                Pay your entire team in a single transaction using Multicall3. 
                Save on gas and simplify payroll operations.
              </p>
            </div>
            <div className="p-6 bg-gray-50 rounded-xl">
              <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center mb-4">
                <TrendingUp className="w-6 h-6 text-primary-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Earn with USYC</h3>
              <p className="text-gray-600">
                Staff can opt to receive USYC, a yield-bearing stablecoin, 
                and start earning immediately upon receiving their salary.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 border-t border-gray-100">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-2 text-gray-500 text-sm">
            <span>Built by</span>
            <a
              href="https://x.com/ronnie_thedev"
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-primary-600 hover:text-primary-700 transition-colors"
            >
              ronnie_thedev
            </a>
            <span>on Arc Testnet</span>
            <span className="text-gray-300">|</span>
            <a
              href="https://github.com/Fejiro11/arc-payroll-dapp"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center space-x-1 hover:text-gray-700 transition-colors"
            >
              <Github className="w-4 h-4" />
              <span>GitHub</span>
            </a>
          </div>
          <div className="flex items-center space-x-4 text-sm text-gray-500">
            <a
              href="https://testnet.arcscan.app"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-gray-700 transition-colors"
            >
              Block Explorer
            </a>
            <a
              href="https://faucet.circle.com"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-gray-700 transition-colors"
            >
              Faucet
            </a>
          </div>
        </div>
      </footer>
    </div>
  )
}
