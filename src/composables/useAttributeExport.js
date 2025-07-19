import { ref } from 'vue'

/**
 * Composable for managing data export functionality
 * Handles CSV, JSON, and other export formats
 */
export function useAttributeExport() {
  // State
  const exporting = ref(false)
  const lastExport = ref(null)
  const exportError = ref(null)

  // Methods
  const exportToCSV = async (data, filename = 'attributes', columns = null) => {
    exporting.value = true
    exportError.value = null

    try {
      // Determine columns to export
      const exportColumns = columns || (data.length > 0 ? Object.keys(data[0]) : [])

      // Create CSV content
      const csvContent = [
        // Header row
        exportColumns.join(','),
        // Data rows
        ...data.map(row =>
          exportColumns.map(col => {
            const value = row[col]
            // Escape commas and quotes in CSV
            if (value === null || value === undefined) return ''
            const stringValue = String(value)
            if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
              return `"${stringValue.replace(/"/g, '""')}"`
            }
            return stringValue
          }).join(',')
        )
      ].join('\n')

      // Create and trigger download
      await downloadFile(csvContent, `${filename}.csv`, 'text/csv')
      lastExport.value = { type: 'CSV', date: new Date(), count: data.length }

    } catch (error) {
      exportError.value = error.message || 'Error al exportar CSV'
      throw error
    } finally {
      exporting.value = false
    }
  }

  const exportToJSON = async (data, filename = 'attributes') => {
    exporting.value = true
    exportError.value = null

    try {
      const jsonContent = JSON.stringify(data, null, 2)
      await downloadFile(jsonContent, `${filename}.json`, 'application/json')
      lastExport.value = { type: 'JSON', date: new Date(), count: data.length }

    } catch (error) {
      exportError.value = error.message || 'Error al exportar JSON'
      throw error
    } finally {
      exporting.value = false
    }
  }

  const exportToExcel = async (data, filename = 'attributes', columns = null) => {
    exporting.value = true
    exportError.value = null

    try {
      // Simple Excel-compatible format (tab-separated values)
      const exportColumns = columns || (data.length > 0 ? Object.keys(data[0]) : [])

      const tsvContent = [
        // Header row
        exportColumns.join('\t'),
        // Data rows
        ...data.map(row =>
          exportColumns.map(col => {
            const value = row[col]
            if (value === null || value === undefined) return ''
            return String(value).replace(/\t/g, ' ').replace(/\n/g, ' ')
          }).join('\t')
        )
      ].join('\n')

      await downloadFile(tsvContent, `${filename}.xls`, 'application/vnd.ms-excel')
      lastExport.value = { type: 'Excel', date: new Date(), count: data.length }

    } catch (error) {
      exportError.value = error.message || 'Error al exportar Excel'
      throw error
    } finally {
      exporting.value = false
    }
  }

  const exportToGeoJSON = async (data, geometryColumn = 'geometry', filename = 'attributes') => {
    exporting.value = true
    exportError.value = null

    try {
      const features = data.map((row, index) => {
        const { [geometryColumn]: geometry, ...properties } = row

        return {
          type: 'Feature',
          id: properties.id || properties.fid || index,
          geometry: geometry || null,
          properties
        }
      })

      const geoJSON = {
        type: 'FeatureCollection',
        features
      }

      const content = JSON.stringify(geoJSON, null, 2)
      await downloadFile(content, `${filename}.geojson`, 'application/geo+json')
      lastExport.value = { type: 'GeoJSON', date: new Date(), count: data.length }

    } catch (error) {
      exportError.value = error.message || 'Error al exportar GeoJSON'
      throw error
    } finally {
      exporting.value = false
    }
  }

  // Helper function to download file
  const downloadFile = (content, filename, mimeType) => {
    return new Promise((resolve, reject) => {
      try {
        const blob = new Blob([content], { type: mimeType })
        const url = URL.createObjectURL(blob)

        const link = document.createElement('a')
        link.href = url
        link.download = filename
        link.style.display = 'none'

        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)

        // Clean up the URL object
        setTimeout(() => {
          URL.revokeObjectURL(url)
          resolve()
        }, 100)

      } catch (error) {
        reject(error)
      }
    })
  }

  // Format data for export (remove internal properties, format values)
  const formatDataForExport = (data, options = {}) => {
    const {
      excludeColumns = [],
      includeColumns = null,
      formatDates = true,
      formatNumbers = true
    } = options

    return data.map(row => {
      const formattedRow = {}

      Object.keys(row).forEach(key => {
        // Skip excluded columns
        if (excludeColumns.includes(key)) return

        // Only include specified columns if provided
        if (includeColumns && !includeColumns.includes(key)) return

        let value = row[key]

        // Format dates
        if (formatDates && value instanceof Date) {
          value = value.toISOString().split('T')[0]
        }

        // Format numbers
        if (formatNumbers && typeof value === 'number') {
          value = Number.isInteger(value) ? value : Number(value.toFixed(2))
        }

        formattedRow[key] = value
      })

      return formattedRow
    })
  }

  // Get suggested filename based on layer name and date
  const getSuggestedFilename = (layerName, prefix = 'attributes') => {
    const date = new Date().toISOString().split('T')[0]
    const safeName = (layerName || prefix).replace(/[^a-zA-Z0-9_-]/g, '_')
    return `${safeName}_${date}`
  }

  // Clear export state
  const clearExportState = () => {
    exportError.value = null
    lastExport.value = null
  }

  return {
    // State
    exporting,
    lastExport,
    exportError,

    // Methods
    exportToCSV,
    exportToJSON,
    exportToExcel,
    exportToGeoJSON,
    formatDataForExport,
    getSuggestedFilename,
    clearExportState
  }
}
