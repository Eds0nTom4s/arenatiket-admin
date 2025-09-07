// Utilitários para lidar com DOM de forma segura
export const safelyAccessElement = (element: HTMLElement | null, callback: (el: HTMLElement) => void) => {
  if (element && element.parentNode && document.contains(element)) {
    try {
      callback(element)
    } catch (error) {
      console.warn('Erro ao acessar elemento DOM:', error)
    }
  }
}

export const safelyDestroyChart = (chart: any) => {
  if (chart && typeof chart.destroy === 'function') {
    try {
      chart.destroy()
    } catch (error) {
      console.warn('Erro ao destruir gráfico:', error)
    }
    return null
  }
  return chart
}

export const isElementInDOM = (element: HTMLElement | null): boolean => {
  return !!(element && element.parentNode && document.contains(element))
}