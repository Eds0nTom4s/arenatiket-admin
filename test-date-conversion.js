// Test script to validate date conversion functions
// Run this in browser console to test

import { convertBrazilianToISO } from './src/utils/validation.ts'

// Test cases
const testCases = [
  '25/12/2024 15:30',
  '01/01/2025 09:00', 
  '15/06/2024 20:45',
  '31/12/2024 23:59'
]

console.log('🧪 Testing date conversion functions...')

testCases.forEach((testDate, index) => {
  try {
    const result = convertBrazilianToISO(testDate)
    console.log(`✅ Test ${index + 1}: ${testDate} → ${result}`)
    
    // Verify round trip
    const dateObj = new Date(result)
    const dayCheck = dateObj.getDate().toString().padStart(2, '0')
    const monthCheck = (dateObj.getMonth() + 1).toString().padStart(2, '0')
    const yearCheck = dateObj.getFullYear()
    const hoursCheck = dateObj.getHours().toString().padStart(2, '0')
    const minutesCheck = dateObj.getMinutes().toString().padStart(2, '0')
    
    const roundTrip = `${dayCheck}/${monthCheck}/${yearCheck} ${hoursCheck}:${minutesCheck}`
    
    if (roundTrip === testDate) {
      console.log(`   ✅ Round trip successful: ${roundTrip}`)
    } else {
      console.log(`   ❌ Round trip failed: Expected ${testDate}, got ${roundTrip}`)
    }
    
  } catch (error) {
    console.log(`❌ Test ${index + 1} failed: ${testDate} → Error: ${error.message}`)
  }
})

console.log('🏁 Date conversion tests completed')

// Test the validation pattern
const pattern = /^(\d{2})\/(\d{2})\/(\d{4}) (\d{2}):(\d{2})$/

testCases.forEach((testDate, index) => {
  const matches = pattern.test(testDate)
  console.log(`Pattern test ${index + 1}: ${testDate} → ${matches ? '✅' : '❌'}`)
})