import { defineStore } from 'pinia'
import { ref } from 'vue'
import { ApiService } from '@/services/api'
import type { SalesReport } from '@/types'
import { useToastStore } from './toast'

export const useReportsStore = defineStore('reports', () => {
  const salesReport = ref<SalesReport | null>(null)
  const loading = ref(false)

  const toastStore = useToastStore()

  // Actions
  const fetchSalesReport = async (params: {
    dataInicio: string
    dataFim: string
    eventoId?: number
  }) => {
    try {
      loading.value = true
      const report = await ApiService.getSalesReport(params)
      salesReport.value = report
      
      toastStore.showSuccess('Relatório gerado com sucesso!')
      
      return report
    } catch (error) {
      console.error('Error fetching sales report:', error)
      throw error
    } finally {
      loading.value = false
    }
  }

  const clearReport = () => {
    salesReport.value = null
  }

  // Helper methods for report analysis
  const getTotalRevenue = () => {
    return salesReport.value?.resumo?.valorTotalVendas || 0
  }

  const getTotalTickets = () => {
    return salesReport.value?.resumo?.totalBilhetesVendidos || 0
  }

  const getAverageTicketPrice = () => {
    return salesReport.value?.resumo?.ticketMedio || 0
  }

  const getTopSellingEvent = () => {
    if (!salesReport.value?.vendasPorEvento?.length) return null
    
    return salesReport.value.vendasPorEvento.reduce((top, current) => 
      current.valorVendas > top.valorVendas ? current : top
    )
  }

  const getBestSalesDay = () => {
    if (!salesReport.value?.vendasPorDia?.length) return null
    
    return salesReport.value.vendasPorDia.reduce((best, current) => 
      current.valorVendas > best.valorVendas ? current : best
    )
  }

  const getRevenueGrowth = () => {
    const salesByDay = salesReport.value?.vendasPorDia || []
    if (salesByDay.length < 2) return 0
    
    const firstHalf = salesByDay.slice(0, Math.floor(salesByDay.length / 2))
    const secondHalf = salesByDay.slice(Math.floor(salesByDay.length / 2))
    
    const firstHalfTotal = firstHalf.reduce((sum, day) => sum + day.valorVendas, 0)
    const secondHalfTotal = secondHalf.reduce((sum, day) => sum + day.valorVendas, 0)
    
    if (firstHalfTotal === 0) return 0
    
    return ((secondHalfTotal - firstHalfTotal) / firstHalfTotal) * 100
  }

  return {
    salesReport,
    loading,
    fetchSalesReport,
    clearReport,
    getTotalRevenue,
    getTotalTickets,
    getAverageTicketPrice,
    getTopSellingEvent,
    getBestSalesDay,
    getRevenueGrowth
  }
})