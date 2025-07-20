import * as XLSX from 'xlsx'

/**
 * Composable para exportar datos a Excel
 * Permite exportar arrays de objetos a formato Excel con encabezados
 */
export function useExcelExport() {

  /**
   * Exporta datos a Excel
   * @param {Array} data - Array de objetos con los datos
   * @param {Array} columns - Array con información de columnas [{key, label}]
   * @param {string} filename - Nombre del archivo (sin extensión)
   * @param {string} sheetName - Nombre de la hoja
   */
  const exportToExcel = (data, columns, filename = 'export', sheetName = 'Datos') => {
    try {
      if (!data || data.length === 0) {
        throw new Error('No hay datos para exportar')
      }

      // Preparar los datos con encabezados personalizados
      const exportData = data.map(row => {
        const exportRow = {}
        columns.forEach(column => {
          exportRow[column.label] = row[column.key] || ''
        })
        return exportRow
      })

      // Crear libro de trabajo
      const workbook = XLSX.utils.book_new()

      // Crear hoja de trabajo
      const worksheet = XLSX.utils.json_to_sheet(exportData)

      // Configurar ancho de columnas automático
      const columnWidths = columns.map(column => ({
        wch: Math.max(column.label.length, 15) // Mínimo 15 caracteres
      }))
      worksheet['!cols'] = columnWidths

      // Agregar la hoja al libro
      XLSX.utils.book_append_sheet(workbook, worksheet, sheetName)

      // Generar archivo y descargar
      const fileName = `${filename}.xlsx`
      XLSX.writeFile(workbook, fileName)

      return {
        success: true,
        message: `Archivo ${fileName} descargado correctamente`,
        filename: fileName
      }

    } catch (error) {
      console.error('Error al exportar a Excel:', error)
      return {
        success: false,
        message: `Error al exportar: ${error.message}`,
        error
      }
    }
  }

  /**
   * Exporta solo los datos filtrados/paginados actualmente visibles
   * @param {Array} visibleData - Datos actualmente visibles en la tabla
   * @param {Array} columns - Columnas de la tabla
   * @param {string} layerName - Nombre de la capa
   */
  const exportVisibleData = (visibleData, columns, layerName = 'Layer') => {
    const timestamp = new Date().toISOString().slice(0, 10)
    const filename = `${layerName}_${timestamp}`

    return exportToExcel(
      visibleData,
      columns,
      filename,
      layerName
    )
  }

  /**
   * Exporta todos los datos de la capa (sin filtros)
   * @param {Array} allData - Todos los datos de la capa
   * @param {Array} columns - Columnas de la tabla
   * @param {string} layerName - Nombre de la capa
   */
  const exportAllData = (allData, columns, layerName = 'Layer') => {
    const timestamp = new Date().toISOString().slice(0, 10)
    const filename = `${layerName}_completo_${timestamp}`

    return exportToExcel(
      allData,
      columns,
      filename,
      `${layerName} - Completo`
    )
  }

  /**
   * Exporta datos seleccionados únicamente
   * @param {Array} selectedData - Datos seleccionados
   * @param {Array} columns - Columnas de la tabla
   * @param {string} layerName - Nombre de la capa
   */
  const exportSelectedData = (selectedData, columns, layerName = 'Layer') => {
    const timestamp = new Date().toISOString().slice(0, 10)
    const filename = `${layerName}_seleccionados_${timestamp}`

    return exportToExcel(
      selectedData,
      columns,
      filename,
      `${layerName} - Seleccionados`
    )
  }

  return {
    exportToExcel,
    exportVisibleData,
    exportAllData,
    exportSelectedData
  }
}
