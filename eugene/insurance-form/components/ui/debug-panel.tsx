"use client"

import { useEffect, useState } from "react"
import { useFormContext, useWatch } from "react-hook-form"
import { useDebug } from "@/hooks/DebugContext"
import { FormData } from "@/types/form"

export function DebugPanel() {
  const { isDebugMode } = useDebug()
  const { control } = useFormContext<FormData>()
  const insuranceDetails = useWatch({
    control,
    name: "insuranceDetails",
  })
  
  if (!isDebugMode) return null
  
  // Format the currency value
  const formatCurrency = (value?: string): string => {
    if (!value) return "$0.00"
    // First, clean the value by removing any $ and , characters
    const cleanValue = value.replace(/[$,]/g, '')
    const numValue = parseFloat(cleanValue)
    return !isNaN(numValue) 
      ? `$${numValue.toFixed(2)}` 
      : "$0.00"
  }
  
  // Check if a string value exists and is not "0" or "$0.00" etc.
  const hasValue = (value?: string): boolean => {
    if (!value) return false
    const cleanValue = value.replace(/[$,%]/g, '')
    const numValue = parseFloat(cleanValue)
    return !isNaN(numValue) && numValue > 0
  }
  
  // Format the percentage value - for fields that should contain percentage values
  const formatPercentage = (value?: string): string => {
    if (!value) return "0%"
    // First check if this is already a dollar amount
    if (value.startsWith('$')) {
      return value // Return dollar amount as is
    }
    // Remove any $ and % signs that might be present
    const cleanValue = value.replace(/[$%]/g, '')
    const numValue = parseFloat(cleanValue)
    return !isNaN(numValue) 
      ? `${numValue}%` 
      : "0%"
  }
  
  // Determine if a commission value is a dollar amount or a percentage
  const isCommissionDollarAmount = (value?: string): boolean => {
    if (!value) return false
    return value.startsWith('$')
  }
  
  // Helper function to get enrollment commission from either field
  const getEnrollmentCommission = (): string | undefined => {
    // Try the standard field first
    if (insuranceDetails?.enrollmentFeeCommission) {
      return insuranceDetails.enrollmentFeeCommission;
    }
    
    // Check for fields that might contain enrollment commission data
    // Add specific field names we know might exist
    const possibleFields = [
      'enrollmentCommission',
      'airtableEnrollmentCommission',
    ];
    
    for (const field of possibleFields) {
      if (insuranceDetails && field in insuranceDetails) {
        const value = insuranceDetails[field as keyof typeof insuranceDetails];
        if (typeof value === 'string') {
          return value;
        }
      }
    }
    
    // As a fallback, try to find any field that includes the words "Enrollment Commission"
    if (insuranceDetails) {
      try {
        // Safely access data without TypeScript errors
        const entries = Object.entries(insuranceDetails as Record<string, unknown>);
        for (const [key, value] of entries) {
          if (key.includes("Enrollment Commission") && typeof value === 'string') {
            return value;
          }
        }
      } catch (e) {
        // If any error occurs, just return undefined
        console.error("Error searching for enrollment commission:", e);
      }
    }
    
    return undefined;
  };
  
  // Determine if enrollment commission exists
  const hasEnrollmentCommission = (): boolean => {
    const commission = getEnrollmentCommission();
    return hasValue(commission);
  };
  
  // Calculate the commission value based on premium and commission percentage/amount
  const calculateCommission = (premium?: string, commission?: string): string => {
    if (!premium || !commission) return "$0.00"
    
    // If commission is already a dollar amount, just return it cleaned up
    if (isCommissionDollarAmount(commission)) {
      // Just clean and format the dollar amount
      const commissionClean = commission.replace(/[$,]/g, '')
      const commissionValue = parseFloat(commissionClean)
      return !isNaN(commissionValue) ? `$${commissionValue.toFixed(2)}` : "$0.00"
    }
    
    // Otherwise calculate it as a percentage
    // Clean the values before calculation
    const premiumClean = premium.replace(/[$,]/g, '')
    const commissionClean = commission.replace(/[$%]/g, '')
    
    const premiumValue = parseFloat(premiumClean)
    const commissionValue = parseFloat(commissionClean)
    
    if (isNaN(premiumValue) || isNaN(commissionValue)) return "$0.00"
    return `$${(premiumValue * commissionValue / 100).toFixed(2)}`
  }
  
  // Extract amount from a string like "AF AME 500 $37.00" or "Behavioral Health +RX $209.95"
  const extractCostFromPlanName = (planName?: string): string => {
    if (!planName) return "$0.00"
    
    // Look for a pattern like "$XX.XX" or "$XXX.XX" anywhere in the string
    const match = planName.match(/\$(\d+\.\d+)/)
    if (match && match[1]) {
      return `$${match[1]}`
    }
    
    // No match found
    return "$0.00"
  }
  
  // Calculate total commissions from individual values
  const calculateTotalCommissions = () => {
    let total = 0;
    
    // Base plan commission
    if (insuranceDetails?.planCommission) {
      const commissionClean = insuranceDetails.planCommission.replace(/[$,]/g, '');
      const commissionValue = parseFloat(commissionClean);
      if (!isNaN(commissionValue)) {
        total += commissionValue;
      }
    }
    
    // Enrollment commission (if exists)
    const enrollmentCommission = getEnrollmentCommission();
    if (enrollmentCommission) {
      const commissionClean = enrollmentCommission.replace(/[$,]/g, '');
      const commissionValue = parseFloat(commissionClean);
      if (!isNaN(commissionValue)) {
        total += commissionValue;
      }
    }
    
    // Only add other commissions if they exist and are valid numbers
    const addOnsTotal = calculateAddonsTotals().commission.replace(/[$,]/g, '');
    const leoAddonsTotal = calculateLeoAddonsTotals().commission.replace(/[$,]/g, '');
    
    total += parseFloat(addOnsTotal) || 0;
    total += parseFloat(leoAddonsTotal) || 0;
    
    return `$${total.toFixed(2)}`;
  }
  
  // Calculate total premiums
  const calculateTotalPremiums = () => {
    let total = 0
    
    // Base plan premium
    if (insuranceDetails?.planCost) {
      const premiumClean = insuranceDetails.planCost.replace(/[$,]/g, '')
      const premiumValue = parseFloat(premiumClean)
      
      if (!isNaN(premiumValue)) {
        total += premiumValue
      }
    }
    
    // ACA plan premium
    if (insuranceDetails?.acaPlanPremium) {
      const premiumClean = insuranceDetails.acaPlanPremium.replace(/[$,]/g, '')
      const premiumValue = parseFloat(premiumClean)
      
      if (!isNaN(premiumValue)) {
        total += premiumValue
      }
    }
    
    // American Financial add-ons premiums
    if (insuranceDetails?.americanFinancial1Premium) {
      const premiumClean = insuranceDetails.americanFinancial1Premium.replace(/[$,]/g, '')
      const premiumValue = parseFloat(premiumClean)
      
      if (!isNaN(premiumValue)) {
        total += premiumValue
      }
    } else if (insuranceDetails?.americanFinancial1Plan) {
      // Try to extract cost from plan name
      const costFromName = extractCostFromPlanName(insuranceDetails.americanFinancial1Plan)
      const premiumValue = parseFloat(costFromName.replace(/[$,]/g, ''))
      
      if (!isNaN(premiumValue)) {
        total += premiumValue
      }
    }
    
    if (insuranceDetails?.americanFinancial2Premium) {
      const premiumClean = insuranceDetails.americanFinancial2Premium.replace(/[$,]/g, '')
      const premiumValue = parseFloat(premiumClean)
      
      if (!isNaN(premiumValue)) {
        total += premiumValue
      }
    } else if (insuranceDetails?.americanFinancial2Plan) {
      // Try to extract cost from plan name
      const costFromName = extractCostFromPlanName(insuranceDetails.americanFinancial2Plan)
      const premiumValue = parseFloat(costFromName.replace(/[$,]/g, ''))
      
      if (!isNaN(premiumValue)) {
        total += premiumValue
      }
    }
    
    if (insuranceDetails?.americanFinancial3Premium) {
      const premiumClean = insuranceDetails.americanFinancial3Premium.replace(/[$,]/g, '')
      const premiumValue = parseFloat(premiumClean)
      
      if (!isNaN(premiumValue)) {
        total += premiumValue
      }
    } else if (insuranceDetails?.americanFinancial3Plan) {
      // Try to extract cost from plan name
      const costFromName = extractCostFromPlanName(insuranceDetails.americanFinancial3Plan)
      const premiumValue = parseFloat(costFromName.replace(/[$,]/g, ''))
      
      if (!isNaN(premiumValue)) {
        total += premiumValue
      }
    }
    
    // AMT add-ons premiums
    if (insuranceDetails?.amt1Premium) {
      const premiumClean = insuranceDetails.amt1Premium.replace(/[$,]/g, '')
      const premiumValue = parseFloat(premiumClean)
      
      if (!isNaN(premiumValue)) {
        total += premiumValue
      }
    }
    
    if (insuranceDetails?.amt2Premium) {
      const premiumClean = insuranceDetails.amt2Premium.replace(/[$,]/g, '')
      const premiumValue = parseFloat(premiumClean)
      
      if (!isNaN(premiumValue)) {
        total += premiumValue
      }
    }
    
    // LEO add-ons premium
    if (insuranceDetails?.leoAddonsPremium) {
      const premiumClean = insuranceDetails.leoAddonsPremium.replace(/[$,]/g, '')
      const premiumValue = parseFloat(premiumClean)
      
      if (!isNaN(premiumValue)) {
        total += premiumValue
      }
    } else if (insuranceDetails?.leoAddonsPlans) {
      // Try to extract cost from plan name
      const costFromName = extractCostFromPlanName(insuranceDetails.leoAddonsPlans)
      const premiumValue = parseFloat(costFromName.replace(/[$,]/g, ''))
      
      if (!isNaN(premiumValue)) {
        total += premiumValue
      }
    }
    
    // Essential Care premium
    if (insuranceDetails?.essentialCarePremium) {
      const premiumClean = insuranceDetails.essentialCarePremium.replace(/[$,]/g, '')
      const premiumValue = parseFloat(premiumClean)
      
      if (!isNaN(premiumValue)) {
        total += premiumValue
      }
    }
    
    // Enrollment fee
    if (insuranceDetails?.enrollmentFee) {
      const feeClean = insuranceDetails.enrollmentFee.replace(/[$,]/g, '')
      const feeValue = parseFloat(feeClean)
      
      if (!isNaN(feeValue)) {
        total += feeValue
      }
    }
    
    return `$${total.toFixed(2)}`
  }
  
  // Add functions to calculate subtotals by section
  
  // Calculate base plan premiums and commissions
  const calculateBasePlanTotals = () => {
    let premiumTotal = 0;
    let commissionTotal = 0;
    
    // Base plan
    if (insuranceDetails?.planCost) {
      const premiumClean = insuranceDetails.planCost.replace(/[$,]/g, '');
      const premiumValue = parseFloat(premiumClean);
      
      if (!isNaN(premiumValue)) {
        premiumTotal += premiumValue;
        
        if (insuranceDetails?.planCommission) {
          if (isCommissionDollarAmount(insuranceDetails.planCommission)) {
            // If commission is a dollar amount, add it directly
            const commissionClean = insuranceDetails.planCommission.replace(/[$,]/g, '');
            const commissionValue = parseFloat(commissionClean);
            if (!isNaN(commissionValue)) {
              commissionTotal += commissionValue;
            }
          } else {
            // Calculate commission as percentage
            const commissionClean = insuranceDetails.planCommission.replace(/[$%]/g, '');
            const commissionValue = parseFloat(commissionClean);
            if (!isNaN(commissionValue)) {
              commissionTotal += (premiumValue * commissionValue / 100);
            }
          }
        }
      }
    }
    
    // ACA plan (included with base plan totals)
    if (insuranceDetails?.acaPlanPremium) {
      const premiumClean = insuranceDetails.acaPlanPremium.replace(/[$,]/g, '');
      const premiumValue = parseFloat(premiumClean);
      
      if (!isNaN(premiumValue)) {
        premiumTotal += premiumValue;
        // ACA plans typically don't have commission, but could add logic here if needed
      }
    }
    
    return {
      premium: `$${premiumTotal.toFixed(2)}`,
      commission: `$${commissionTotal.toFixed(2)}`
    };
  };
  
  // Calculate add-ons totals (American Financial and AMT)
  const calculateAddonsTotals = () => {
    let premiumTotal = 0;
    let commissionTotal = 0;
    
    // American Financial add-ons
    for (let i = 1; i <= 3; i++) {
      const planKey = `americanFinancial${i}Plan` as keyof typeof insuranceDetails;
      const premiumKey = `americanFinancial${i}Premium` as keyof typeof insuranceDetails;
      const commissionKey = `americanFinancial${i}Commission` as keyof typeof insuranceDetails;
      
      const plan = insuranceDetails?.[planKey] as string | undefined;
      const premium = insuranceDetails?.[premiumKey] as string | undefined;
      const commission = insuranceDetails?.[commissionKey] as string | undefined;
      
      // Get the effective premium (either from premium field or extracted from plan name)
      let effectivePremium = premium || "$0.00";
      if (!hasValue(effectivePremium) && plan) {
        effectivePremium = extractCostFromPlanName(plan);
      }
      
      if (hasValue(effectivePremium)) {
        const premiumClean = effectivePremium.replace(/[$,]/g, '');
        const premiumValue = parseFloat(premiumClean);
        
        if (!isNaN(premiumValue)) {
          premiumTotal += premiumValue;
          
          // Calculate commission
          if (commission) {
            if (isCommissionDollarAmount(commission)) {
              const commissionClean = commission.replace(/[$,]/g, '');
              const commissionValue = parseFloat(commissionClean);
              if (!isNaN(commissionValue)) {
                commissionTotal += commissionValue;
              }
            } else {
              const commissionClean = commission.replace(/[$%]/g, '');
              const commissionValue = parseFloat(commissionClean) || 100; // Default to 100% if not specified
              if (!isNaN(commissionValue)) {
                commissionTotal += (premiumValue * commissionValue / 100);
              }
            }
          } else {
            // Default 100% commission if not specified
            commissionTotal += premiumValue;
          }
        }
      }
    }
    
    // AMT add-ons
    for (let i = 1; i <= 2; i++) {
      const planKey = `amt${i}Plan` as keyof typeof insuranceDetails;
      const premiumKey = `amt${i}Premium` as keyof typeof insuranceDetails;
      const commissionKey = `amt${i}Commission` as keyof typeof insuranceDetails;
      
      const plan = insuranceDetails?.[planKey] as string | undefined;
      const premium = insuranceDetails?.[premiumKey] as string | undefined;
      const commission = insuranceDetails?.[commissionKey] as string | undefined;
      
      // Get the effective premium
      let effectivePremium = premium || "$0.00";
      if (!hasValue(effectivePremium) && plan) {
        effectivePremium = extractCostFromPlanName(plan);
      }
      
      if (hasValue(effectivePremium)) {
        const premiumClean = effectivePremium.replace(/[$,]/g, '');
        const premiumValue = parseFloat(premiumClean);
        
        if (!isNaN(premiumValue)) {
          premiumTotal += premiumValue;
          
          // Calculate commission
          if (commission) {
            if (isCommissionDollarAmount(commission)) {
              const commissionClean = commission.replace(/[$,]/g, '');
              const commissionValue = parseFloat(commissionClean);
              if (!isNaN(commissionValue)) {
                commissionTotal += commissionValue;
              }
            } else {
              const commissionClean = commission.replace(/[$%]/g, '');
              const commissionValue = parseFloat(commissionClean) || 100; // Default to 100% if not specified
              if (!isNaN(commissionValue)) {
                commissionTotal += (premiumValue * commissionValue / 100);
              }
            }
          } else {
            // Default 100% commission if not specified
            commissionTotal += premiumValue;
          }
        }
      }
    }
    
    // Essential Care (included with add-ons)
    if (insuranceDetails?.essentialCarePremium) {
      const premiumClean = insuranceDetails.essentialCarePremium.replace(/[$,]/g, '');
      const premiumValue = parseFloat(premiumClean);
      
      if (!isNaN(premiumValue)) {
        premiumTotal += premiumValue;
        
        if (insuranceDetails?.essentialCareCommission) {
          if (isCommissionDollarAmount(insuranceDetails.essentialCareCommission)) {
            const commissionClean = insuranceDetails.essentialCareCommission.replace(/[$,]/g, '');
            const commissionValue = parseFloat(commissionClean);
            if (!isNaN(commissionValue)) {
              commissionTotal += commissionValue;
            }
          } else {
            const commissionClean = insuranceDetails.essentialCareCommission.replace(/[$%]/g, '');
            const commissionValue = parseFloat(commissionClean);
            if (!isNaN(commissionValue)) {
              commissionTotal += (premiumValue * commissionValue / 100);
            }
          }
        }
      }
    }
    
    return {
      premium: `$${premiumTotal.toFixed(2)}`,
      commission: `$${commissionTotal.toFixed(2)}`
    };
  };
  
  // Calculate LEO add-ons totals
  const calculateLeoAddonsTotals = () => {
    let premiumTotal = 0;
    let commissionTotal = 0;
    
    // Function to calculate LEO commission
    const calculateLeoCommission = (premiumValue: number): number => {
      // Check if commission is a dollar amount (incorrect format)
      if (insuranceDetails?.leoAddonsCommission && isCommissionDollarAmount(insuranceDetails.leoAddonsCommission)) {
        // Default to 60% commission when formatted incorrectly
        return premiumValue * 60 / 100;
      } else if (insuranceDetails?.leoAddonsCommission) {
        // Use the provided commission percentage
        const commissionClean = insuranceDetails.leoAddonsCommission.replace(/[$%]/g, '');
        const commissionValue = parseFloat(commissionClean);
        return !isNaN(commissionValue) ? (premiumValue * commissionValue / 100) : premiumValue; // Default to 100% if NaN
      } else {
        // Default to 100% if no commission specified
        return premiumValue;
      }
    };
    
    // If we have a direct premium value
    if (insuranceDetails?.leoAddonsPremium) {
      const premiumClean = insuranceDetails.leoAddonsPremium.replace(/[$,]/g, '');
      const premiumValue = parseFloat(premiumClean);
      
      if (!isNaN(premiumValue)) {
        premiumTotal += premiumValue;
        commissionTotal += calculateLeoCommission(premiumValue);
      }
    } 
    // If we have individual plans
    else if (insuranceDetails?.leoAddonsPlans) {
      // Split plans and calculate individually
      const plans = insuranceDetails.leoAddonsPlans.split(/[,;\n]+/).map(p => p.trim()).filter(p => p);
      
      plans.forEach(plan => {
        const extractedPremium = extractCostFromPlanName(plan);
        if (extractedPremium !== "$0.00") {
          const premiumValue = parseFloat(extractedPremium.replace(/[$,]/g, ''));
          if (!isNaN(premiumValue)) {
            premiumTotal += premiumValue;
            commissionTotal += calculateLeoCommission(premiumValue);
          }
        }
      });
    }
    
    return {
      premium: `$${premiumTotal.toFixed(2)}`,
      commission: `$${commissionTotal.toFixed(2)}`
    };
  };
  
  // Calculate enrollment fee and commission
  const calculateEnrollmentTotals = () => {
    let feeTotal = 0;
    let commissionTotal = 0;
    
    if (insuranceDetails?.enrollmentFee) {
      const feeClean = insuranceDetails.enrollmentFee.replace(/[$,]/g, '');
      const feeValue = parseFloat(feeClean);
      
      if (!isNaN(feeValue)) {
        feeTotal += feeValue;
      }
    }
    
    // Get enrollment commission from helper function
    const enrollmentCommission = getEnrollmentCommission();
    if (enrollmentCommission) {
      const commissionClean = enrollmentCommission.replace(/[$,]/g, '');
      const commissionValue = parseFloat(commissionClean);
      
      if (!isNaN(commissionValue)) {
        commissionTotal += commissionValue;
      }
    }
    
    return {
      premium: `$${feeTotal.toFixed(2)}`,
      commission: `$${commissionTotal.toFixed(2)}`
    };
  };
  
  const totalPremiums = calculateTotalPremiums()
  const totalCommissions = calculateTotalCommissions()
  
  // Calculate section totals
  const basePlanTotals = calculateBasePlanTotals();
  const addonsTotals = calculateAddonsTotals();
  const leoAddonsTotals = calculateLeoAddonsTotals();
  const enrollmentTotals = calculateEnrollmentTotals();
  
  // Extract premium from plan if not provided separately
  const getEffectivePremium = (premium?: string, planName?: string): string => {
    if (hasValue(premium)) return formatCurrency(premium)
    if (planName) {
      // Try to extract from plan name
      return extractCostFromPlanName(planName)
    }
    return "$0.00"
  }
  
  // Helper to get a display value for American Financial add-ons
  const getAmericanFinancialDisplayData = (plan?: string, premium?: string, commission?: string) => {
    if (!plan) return null
    
    const effectivePremium = getEffectivePremium(premium, plan)
    
    return {
      plan,
      premium: effectivePremium,
      commission: commission || "0%",
      commissionValue: calculateCommission(effectivePremium, commission)
    }
  }
  
  return (
    <div className="fixed bottom-4 right-4 w-96 max-h-[80vh] overflow-y-auto bg-white dark:bg-gray-900 border-2 border-amber-400 rounded-lg shadow-lg p-4 z-50">
      <h3 className="text-lg font-bold mb-4 text-amber-600 dark:text-amber-400">Debug: Insurance Calculations</h3>
      
      {/* Base Plan Section */}
      <div className="mb-4 border-b pb-2">
        <h4 className="font-semibold text-amber-600 dark:text-amber-400 mb-1">Base Plan</h4>
        {insuranceDetails?.plan && (
          <div className="grid grid-cols-2 gap-1 text-sm">
            <span className="font-medium">Plan:</span>
            <span>{insuranceDetails.plan}</span>
            
            <span className="font-medium">Premium:</span>
            <span>{formatCurrency(insuranceDetails.planCost)}</span>
            
            <span className="font-medium">Commission:</span>
            <span>{isCommissionDollarAmount(insuranceDetails.planCommission) 
              ? formatCurrency(insuranceDetails.planCommission) 
              : formatPercentage(insuranceDetails.planCommission)}</span>
            
            <span className="font-medium">Commission Value:</span>
            <span className="font-bold">{calculateCommission(insuranceDetails.planCost, insuranceDetails.planCommission)}</span>
            
            <span className="text-xs text-gray-500 col-span-2">Raw inputs: Cost: {insuranceDetails.planCost}, Commission: {insuranceDetails.planCommission}</span>
          </div>
        )}
        {!insuranceDetails?.plan && <p className="text-sm text-gray-500">No base plan selected</p>}
      </div>
      
      {/* ACA Plan Section */}
      {(hasValue(insuranceDetails?.acaPlanPremium) || insuranceDetails?.carrierACA) && (
        <div className="mb-4 border-b pb-2">
          <h4 className="font-semibold text-amber-600 dark:text-amber-400 mb-1">ACA Plan</h4>
          <div className="grid grid-cols-2 gap-1 text-sm">
            <span className="font-medium">Carrier:</span>
            <span>{insuranceDetails?.carrierACA || 'Not selected'}</span>
            
            <span className="font-medium">Premium:</span>
            <span>{formatCurrency(insuranceDetails?.acaPlanPremium)}</span>
            
            <span className="font-medium">Deductible:</span>
            <span>{formatCurrency(insuranceDetails?.acaPlanDeductible)}</span>
            
            <span className="text-xs text-gray-500 col-span-2">Raw inputs: Premium: {insuranceDetails?.acaPlanPremium}, Deductible: {insuranceDetails?.acaPlanDeductible}</span>
          </div>
        </div>
      )}
      
      {/* Enrollment Fee Section */}
      {(hasValue(insuranceDetails?.enrollmentFee) || hasEnrollmentCommission()) && (
        <div className="mb-4 border-b pb-2">
          <h4 className="font-semibold text-amber-600 dark:text-amber-400 mb-1">Enrollment Fee</h4>
          <div className="grid grid-cols-2 gap-1 text-sm">
            <span className="font-medium">Fee:</span>
            <span>{formatCurrency(insuranceDetails?.enrollmentFee)}</span>
            
            <span className="font-medium">Commission (Flat):</span>
            <span className="font-bold">
              {hasEnrollmentCommission() 
                ? formatCurrency(getEnrollmentCommission())
                : "$0.00"
              }
            </span>
            
            <span className="text-xs text-gray-500 col-span-2">
              Raw inputs: Fee: {insuranceDetails?.enrollmentFee}, 
              Commission: {getEnrollmentCommission() || "(not set)"}
            </span>
          </div>
        </div>
      )}
      
      {/* American Financial Add-ons */}
      {(insuranceDetails?.americanFinancial1Plan || 
        insuranceDetails?.americanFinancial2Plan || 
        insuranceDetails?.americanFinancial3Plan ||
        hasValue(insuranceDetails?.americanFinancial1Premium) || 
        hasValue(insuranceDetails?.americanFinancial2Premium) || 
        hasValue(insuranceDetails?.americanFinancial3Premium)) && (
        <div className="mb-4 border-b pb-2">
          <h4 className="font-semibold text-amber-600 dark:text-amber-400 mb-1">American Financial Add-ons</h4>
          
          {insuranceDetails?.americanFinancial1Plan && (
            <div className="grid grid-cols-2 gap-1 text-sm mt-2 bg-gray-50 dark:bg-gray-800 p-2 rounded">
              <span className="font-medium">Plan 1:</span>
              <span>{insuranceDetails.americanFinancial1Plan}</span>
              
              <span className="font-medium">Premium:</span>
              <span>{getEffectivePremium(insuranceDetails.americanFinancial1Premium, insuranceDetails.americanFinancial1Plan)}</span>
              
              <span className="font-medium">Commission %:</span>
              <span>{formatPercentage(insuranceDetails.americanFinancial1Commission || "100")}</span>
              
              <span className="font-medium">Commission Value:</span>
              <span className="font-bold">
                {calculateCommission(
                  getEffectivePremium(insuranceDetails.americanFinancial1Premium, insuranceDetails.americanFinancial1Plan),
                  insuranceDetails.americanFinancial1Commission || "100"
                )}
              </span>
              
              <span className="text-xs text-gray-500 col-span-2">Raw inputs: Premium: {insuranceDetails.americanFinancial1Premium || "(from plan name)"}, Commission: {insuranceDetails.americanFinancial1Commission || "100%"}</span>
            </div>
          )}
          
          {insuranceDetails?.americanFinancial2Plan && (
            <div className="grid grid-cols-2 gap-1 text-sm mt-2 bg-gray-50 dark:bg-gray-800 p-2 rounded">
              <span className="font-medium">Plan 2:</span>
              <span>{insuranceDetails.americanFinancial2Plan}</span>
              
              <span className="font-medium">Premium:</span>
              <span>{getEffectivePremium(insuranceDetails.americanFinancial2Premium, insuranceDetails.americanFinancial2Plan)}</span>
              
              <span className="font-medium">Commission %:</span>
              <span>{formatPercentage(insuranceDetails.americanFinancial2Commission || "100")}</span>
              
              <span className="font-medium">Commission Value:</span>
              <span className="font-bold">
                {calculateCommission(
                  getEffectivePremium(insuranceDetails.americanFinancial2Premium, insuranceDetails.americanFinancial2Plan),
                  insuranceDetails.americanFinancial2Commission || "100"
                )}
              </span>
              
              <span className="text-xs text-gray-500 col-span-2">Raw inputs: Premium: {insuranceDetails.americanFinancial2Premium || "(from plan name)"}, Commission: {insuranceDetails.americanFinancial2Commission || "100%"}</span>
            </div>
          )}
          
          {insuranceDetails?.americanFinancial3Plan && (
            <div className="grid grid-cols-2 gap-1 text-sm mt-2 bg-gray-50 dark:bg-gray-800 p-2 rounded">
              <span className="font-medium">Plan 3:</span>
              <span>{insuranceDetails.americanFinancial3Plan}</span>
              
              <span className="font-medium">Premium:</span>
              <span>{getEffectivePremium(insuranceDetails.americanFinancial3Premium, insuranceDetails.americanFinancial3Plan)}</span>
              
              <span className="font-medium">Commission %:</span>
              <span>{formatPercentage(insuranceDetails.americanFinancial3Commission || "100")}</span>
              
              <span className="font-medium">Commission Value:</span>
              <span className="font-bold">
                {calculateCommission(
                  getEffectivePremium(insuranceDetails.americanFinancial3Premium, insuranceDetails.americanFinancial3Plan),
                  insuranceDetails.americanFinancial3Commission || "100"
                )}
              </span>
              
              <span className="text-xs text-gray-500 col-span-2">Raw inputs: Premium: {insuranceDetails.americanFinancial3Premium || "(from plan name)"}, Commission: {insuranceDetails.americanFinancial3Commission || "100%"}</span>
            </div>
          )}
        </div>
      )}
      
      {/* AMT Add-ons */}
      {(hasValue(insuranceDetails?.amt1Premium) || hasValue(insuranceDetails?.amt2Premium) || 
        insuranceDetails?.amt1Plan || insuranceDetails?.amt2Plan) && (
        <div className="mb-4 border-b pb-2">
          <h4 className="font-semibold text-amber-600 dark:text-amber-400 mb-1">AMT Add-ons</h4>
          
          {insuranceDetails?.amt1Plan && (
            <div className="grid grid-cols-2 gap-1 text-sm mt-2 bg-gray-50 dark:bg-gray-800 p-2 rounded">
              <span className="font-medium">Plan 1:</span>
              <span>{insuranceDetails.amt1Plan}</span>
              
              <span className="font-medium">Premium:</span>
              <span>{getEffectivePremium(insuranceDetails.amt1Premium, insuranceDetails.amt1Plan)}</span>
              
              <span className="font-medium">Commission %:</span>
              <span>{formatPercentage(insuranceDetails.amt1Commission || "100")}</span>
              
              <span className="font-medium">Commission Value:</span>
              <span className="font-bold">
                {calculateCommission(
                  getEffectivePremium(insuranceDetails.amt1Premium, insuranceDetails.amt1Plan),
                  insuranceDetails.amt1Commission || "100"
                )}
              </span>
              
              <span className="text-xs text-gray-500 col-span-2">Raw inputs: Premium: {insuranceDetails.amt1Premium || "(from plan name)"}, Commission: {insuranceDetails.amt1Commission || "100%"}</span>
            </div>
          )}
          
          {insuranceDetails?.amt2Plan && (
            <div className="grid grid-cols-2 gap-1 text-sm mt-2 bg-gray-50 dark:bg-gray-800 p-2 rounded">
              <span className="font-medium">Plan 2:</span>
              <span>{insuranceDetails.amt2Plan}</span>
              
              <span className="font-medium">Premium:</span>
              <span>{getEffectivePremium(insuranceDetails.amt2Premium, insuranceDetails.amt2Plan)}</span>
              
              <span className="font-medium">Commission %:</span>
              <span>{formatPercentage(insuranceDetails.amt2Commission || "100")}</span>
              
              <span className="font-medium">Commission Value:</span>
              <span className="font-bold">
                {calculateCommission(
                  getEffectivePremium(insuranceDetails.amt2Premium, insuranceDetails.amt2Plan),
                  insuranceDetails.amt2Commission || "100"
                )}
              </span>
              
              <span className="text-xs text-gray-500 col-span-2">Raw inputs: Premium: {insuranceDetails.amt2Premium || "(from plan name)"}, Commission: {insuranceDetails.amt2Commission || "100%"}</span>
            </div>
          )}
        </div>
      )}
      
      {/* LEO Add-ons */}
      {(hasValue(insuranceDetails?.leoAddonsPremium) || insuranceDetails?.leoAddonsPlans) && (
        <div className="mb-4 border-b pb-2">
          <h4 className="font-semibold text-amber-600 dark:text-amber-400 mb-1">LEO Add-ons</h4>
          
          {/* Parse the LEO plans into individual lines */}
          {(() => {
            // Parse the plans string if available
            if (insuranceDetails?.leoAddonsPlans) {
              // Split by commas, semicolons, or newlines
              const plans = insuranceDetails.leoAddonsPlans.split(/[,;\n]+/).map(p => p.trim()).filter(p => p);
              
              if (plans.length > 0) {
                return plans.map((plan, index) => {
                  // Extract premium from the plan name directly for each individual plan
                  const extractedPremium = extractCostFromPlanName(plan);
                  
                  return (
                    <div key={index} className="grid grid-cols-2 gap-1 text-sm mt-2 bg-gray-50 dark:bg-gray-800 p-2 rounded">
                      <span className="font-medium">Plan {index + 1}:</span>
                      <span>{plan}</span>
                      
                      <span className="font-medium">Premium:</span>
                      <span>{extractedPremium !== "$0.00" ? extractedPremium : "Unknown"}</span>
                      
                      <span className="font-medium">Commission %:</span>
                      <span>{
                        // Check if it's a dollar amount and fix if needed
                        isCommissionDollarAmount(insuranceDetails?.leoAddonsCommission)
                          ? formatPercentage("60") // Default to 60% if it's incorrectly formatted as $ amount
                          : formatPercentage(insuranceDetails?.leoAddonsCommission || "100")
                      }</span>
                      
                      {/* Only show commission value if we have a premium */}
                      {extractedPremium !== "$0.00" && (
                        <>
                          <span className="font-medium">Commission Value:</span>
                          <span className="font-bold">
                            {calculateCommission(
                              extractedPremium,
                              isCommissionDollarAmount(insuranceDetails?.leoAddonsCommission)
                                ? "60" // Default to 60% if it's incorrectly formatted as $ amount
                                : insuranceDetails?.leoAddonsCommission || "100"
                            )}
                          </span>
                        </>
                      )}
                      
                      {index === 0 && (
                        <span className="text-xs text-gray-500 col-span-2">
                          Raw inputs: Premium: {extractedPremium !== "$0.00" ? extractedPremium : "(not found)"}, 
                          Commission: {insuranceDetails?.leoAddonsCommission || "100%"}
                          {isCommissionDollarAmount(insuranceDetails?.leoAddonsCommission) && " (appears to be $ amount, treating as 60%)"}
                        </span>
                      )}
                    </div>
                  );
                });
              }
            }
            
            // Fallback if no plans specified but we have premium
            if (hasValue(insuranceDetails?.leoAddonsPremium)) {
              return (
                <div className="grid grid-cols-2 gap-1 text-sm bg-gray-50 dark:bg-gray-800 p-2 rounded">
                  <span className="font-medium">Plans:</span>
                  <span>Not specified</span>
                  
                  <span className="font-medium">Premium:</span>
                  <span>{formatCurrency(insuranceDetails?.leoAddonsPremium)}</span>
                  
                  <span className="font-medium">Commission %:</span>
                  <span>{
                    isCommissionDollarAmount(insuranceDetails?.leoAddonsCommission)
                      ? formatPercentage("60") // Default to 60% if it's incorrectly formatted as $ amount
                      : formatPercentage(insuranceDetails?.leoAddonsCommission || "100")
                  }</span>
                  
                  <span className="font-medium">Commission Value:</span>
                  <span className="font-bold">
                    {calculateCommission(
                      insuranceDetails?.leoAddonsPremium,
                      isCommissionDollarAmount(insuranceDetails?.leoAddonsCommission)
                        ? "60" // Default to 60% if it's incorrectly formatted as $ amount
                        : insuranceDetails?.leoAddonsCommission || "100"
                    )}
                  </span>
                  
                  <span className="text-xs text-gray-500 col-span-2">
                    Raw inputs: Premium: {insuranceDetails?.leoAddonsPremium}, 
                    Commission: {insuranceDetails?.leoAddonsCommission || "100%"}
                    {isCommissionDollarAmount(insuranceDetails?.leoAddonsCommission) && " (appears to be $ amount, treating as 60%)"}
                  </span>
                </div>
              );
            }
            
            return null;
          })()}
        </div>
      )}
      
      {/* Essential Care */}
      {hasValue(insuranceDetails?.essentialCarePremium) && (
        <div className="mb-4 border-b pb-2">
          <h4 className="font-semibold text-amber-600 dark:text-amber-400 mb-1">Essential Care</h4>
          <div className="grid grid-cols-2 gap-1 text-sm bg-gray-50 dark:bg-gray-800 p-2 rounded">
            <span className="font-medium">Premium:</span>
            <span>{formatCurrency(insuranceDetails?.essentialCarePremium)}</span>
            
            <span className="font-medium">Commission %:</span>
            <span>{formatPercentage(insuranceDetails?.essentialCareCommission)}</span>
            
            <span className="font-medium">Commission Value:</span>
            <span className="font-bold">{calculateCommission(insuranceDetails?.essentialCarePremium, insuranceDetails?.essentialCareCommission)}</span>
            
            <span className="text-xs text-gray-500 col-span-2">Raw inputs: Premium: {insuranceDetails?.essentialCarePremium}, Commission: {insuranceDetails?.essentialCareCommission || "0%"}</span>
          </div>
        </div>
      )}
      
      {/* Totals Section */}
      <div className="mt-4 pt-2 bg-amber-50 dark:bg-amber-900/20 p-3 rounded-lg">
        <h4 className="font-semibold text-amber-700 dark:text-amber-300 mb-1">Totals</h4>
        
        {/* Breakdown by Section */}
        <div className="mb-3 border-b border-amber-200 dark:border-amber-800 pb-2">
          <h5 className="text-sm font-medium text-amber-600 dark:text-amber-400">Breakdown by Section</h5>
          
          {/* Base Plan Section */}
          <div className="grid grid-cols-3 gap-1 text-sm mt-2">
            <span className="font-medium">Base Plan:</span>
            <span>{basePlanTotals.premium}</span>
            <span>{basePlanTotals.commission}</span>
          </div>
          
          {/* Add-ons Section */}
          <div className="grid grid-cols-3 gap-1 text-sm mt-1">
            <span className="font-medium">Add-ons:</span>
            <span>{addonsTotals.premium}</span>
            <span>{addonsTotals.commission}</span>
          </div>
          
          {/* LEO Add-ons Section */}
          <div className="grid grid-cols-3 gap-1 text-sm mt-1">
            <span className="font-medium">LEO Add-ons:</span>
            <span>{leoAddonsTotals.premium}</span>
            <span>{leoAddonsTotals.commission}</span>
          </div>
          
          {/* Enrollment Section */}
          <div className="grid grid-cols-3 gap-1 text-sm mt-1">
            <span className="font-medium">Enrollment:</span>
            <span>{enrollmentTotals.premium}</span>
            <span>{enrollmentTotals.commission}</span>
          </div>
          
          {/* Column Headers */}
          <div className="grid grid-cols-3 gap-1 text-xs text-gray-500 mt-1">
            <span></span>
            <span>Premium</span>
            <span>Commission</span>
          </div>
        </div>
        
        {/* Overall Totals */}
        <div className="grid grid-cols-2 gap-1 text-sm">
          <span className="font-medium">Total Premium:</span>
          <span className="font-bold text-base">{totalPremiums}</span>
          
          <span className="font-medium">Total Commission:</span>
          <span className="font-bold text-base">{totalCommissions}</span>
        </div>
        <div className="grid grid-cols-2 gap-1 text-sm mt-2">
          <span className="font-medium">Form Total Premium:</span>
          <span className="font-bold text-base">{formatCurrency(insuranceDetails?.totalPremium)}</span>
          
          <span className="font-medium">Form Total Commission:</span>
          <span className="font-bold text-base">{formatCurrency(insuranceDetails?.totalCommission)}</span>
        </div>
        
        <div className="text-xs text-gray-600 mt-2">
          <div>Raw form totals: Premium: {insuranceDetails?.totalPremium}, Commission: {insuranceDetails?.totalCommission}</div>
        </div>
      </div>
      
      {/* Debug input values section */}
      <div className="mt-4 pt-2 border-t border-gray-200 dark:border-gray-700">
        <details open>
          <summary className="cursor-pointer font-medium text-amber-600 dark:text-amber-400">Raw Input Values</summary>
          <div className="mt-2 text-xs font-mono bg-gray-50 dark:bg-gray-800 p-2 rounded overflow-x-auto">
            <div>planCost: {JSON.stringify(insuranceDetails?.planCost)}</div>
            <div>planCommission: {JSON.stringify(insuranceDetails?.planCommission)}</div>
            <div>enrollmentFee: {JSON.stringify(insuranceDetails?.enrollmentFee)}</div>
            <div>enrollmentFeeCommission: {JSON.stringify(insuranceDetails?.enrollmentFeeCommission)}</div>
            <div>Enrollment Commission (calculated): {JSON.stringify(getEnrollmentCommission())}</div>
            
            {/* Display all fields containing 'commission' or 'enrollment' */}
            <div className="mt-2 border-t border-gray-300 pt-2">
              <div className="font-semibold">All Commission/Enrollment Fields:</div>
              {Object.entries(insuranceDetails || {}).map(([key, value]) => {
                if (key.toLowerCase().includes('commission') || key.toLowerCase().includes('enrollment')) {
                  return (
                    <div key={key}>{key}: {JSON.stringify(value)}</div>
                  );
                }
                return null;
              })}
            </div>
            
            <div className="mt-2 border-t border-gray-300 pt-2">
              <div>americanFinancial1Plan: {JSON.stringify(insuranceDetails?.americanFinancial1Plan)}</div>
              <div>americanFinancial1Premium: {JSON.stringify(insuranceDetails?.americanFinancial1Premium)}</div>
              <div>americanFinancial1Commission: {JSON.stringify(insuranceDetails?.americanFinancial1Commission)}</div>
              <div>americanFinancial2Plan: {JSON.stringify(insuranceDetails?.americanFinancial2Plan)}</div>
              <div>americanFinancial2Premium: {JSON.stringify(insuranceDetails?.americanFinancial2Premium)}</div>
              <div>americanFinancial2Commission: {JSON.stringify(insuranceDetails?.americanFinancial2Commission)}</div>
              <div>leoAddonsPremium: {JSON.stringify(insuranceDetails?.leoAddonsPremium)}</div>
              <div>leoAddonsCommission: {JSON.stringify(insuranceDetails?.leoAddonsCommission)}</div>
              <div>leoAddonsPlans: {JSON.stringify(insuranceDetails?.leoAddonsPlans)}</div>
              <div>totalPremium: {JSON.stringify(insuranceDetails?.totalPremium)}</div>
              <div>totalCommission: {JSON.stringify(insuranceDetails?.totalCommission)}</div>
            </div>
          </div>
        </details>
      </div>
    </div>
  )
} 