"use client"

import { useRef, useEffect, useState } from "react"
import { useForm, FormProvider } from "react-hook-form"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import BasicInformation from "./form-sections/basic-information"
import HealthInformation from "./form-sections/health-information"
import InsuranceDetails from "./form-sections/insurance-details"
import PersonalDetails from "./form-sections/personal-details"
import ContactNumbers from "./form-sections/contact-numbers"
import AddressInformation from "./form-sections/address-information"
import DependentsInformation from "./form-sections/dependents-information"
import BillingInformation from "./form-sections/billing-information"
import AgentInformation from "./form-sections/agent-information"
import { submitToAirtable } from "@/lib/airtable"
import { toast } from "sonner"
import { FormData } from "@/types/form"
import { useDebug } from "@/hooks/DebugContext"

export default function InsuranceForm() {
  const [activeSection, setActiveSection] = useState("basicInformation")
  const methods = useForm<FormData>()
  const sectionRefs = useRef<Record<string, HTMLDivElement | null>>({})
  const { isDebugMode, toggleDebugMode } = useDebug()

  const handleSubmit = async (data: FormData) => {
    const { leadId, firstName, lastName } = data.basicInformation || {}

    if (!leadId || !firstName || !lastName) {
      toast.error("Please fill in Lead ID, First Name, and Last Name")
      scrollToSection("basicInformation")
      return
    }

    try {
      console.log('Submitting form data:', JSON.stringify(data, null, 2));
      const response = await submitToAirtable(data)
      toast.success("Form submitted successfully!")
      methods.reset()
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } catch (error) {
      console.error("Error submitting form:", error)
      let errorMessage = "Failed to submit form.";
      
      if (error instanceof Error) {
        errorMessage += " " + error.message;
      }
      
      toast.error(errorMessage, {
        duration: 6000, // Show for longer (6 seconds)
        description: "Please check the console for more details."
      })
    }
  }

  // Function to fill test data
  const fillTestData = () => {
    // Dummy data to fill all form fields for testing
    const testData: FormData = {
      basicInformation: {
        leadId: "", // Empty lead ID for free input by the user
        firstName: "Test",
        lastName: "User",
        email: "test@example.com",
        dateOfBirth: "1990-01-01", // ISO format for dates
        leadSource: "website"
      },
      healthInformation: {
        currentlyInsured: true,
        lastTimeInsured: "2023-01-01",
        currentMedications: "Aspirin, Vitamin D, Lisinopril",
        preExistingConditions: "Hypertension, Asthma",
        majorHospitalizations: "Appendectomy 2018, Knee surgery 2020",
        projectedAnnualIncome: "60000" // Currency field expecting number
      },
      insuranceDetails: {
        insuranceState: "CA",
        typeOfInsurance: "Individual",
        carrierU65: "Blue Cross",
        plan: "Premium Plan",
        planCost: "350",
        planCommission: "75",
        carrierACA: "Ambetter",
        acaPlanPremium: "450", // Currency field expecting number
        acaPlanDeductible: "2500",
        enrollmentFee: "100",
        enrollmentFeeCommission: "20",
        americanFinancial1Premium: "50",
        americanFinancial1Commission: "15",
        americanFinancial1Plan: "AF AD&D 50K $93.00", // Add plan name 
        americanFinancial2Premium: "75",
        americanFinancial2Commission: "20",
        americanFinancial2Plan: "AF AME 500 $35.00", // Add plan name
        americanFinancial3Premium: "125",
        americanFinancial3Commission: "30",
        americanFinancial3Plan: "AF Critical Illness (N/A FL,IA,LA,MD,MI,MO,MT,SC,TN,TX,WV,WY) 2,500 $64.00", // Add plan name
        essentialCarePremium: "100",
        essentialCareCommission: "25",
        totalPremium: "1150",
        totalCommission: "185",
        hasAddons: true,
        selectedAddons: ["Dental", "Vision"],
        addonsCost: "75"
      },
      personalDetails: {
        ssn: "123-45-6789",
        gender: "male",
        height: "72",
        weight: "180",
        smokerStatus: false
      },
      addressInformation: {
        addressLine1: "123 Test Street",
        addressLine2: "Apt 4B",
        city: "Testville",
        state: "CA",
        zipCode: "12345" // Should be converted to number
      },
      contactNumbers: {
        cellPhone: "(555) 123-4567",
        workPhone: "(555) 987-6543"
      },
      dependentsInformation: [
        {
          name: "Test Child 1",
          dob: "2010-05-15", // ISO format for dates
          ssn: "987-65-4321",
          gender: "female",
          relationship: "child"
        },
        {
          name: "Test Spouse",
          dob: "1992-03-20", // ISO format for dates
          ssn: "456-78-9123",
          gender: "female",
          relationship: "spouse"
        },
        {
          name: "Test Child 2",
          dob: "2012-07-19", // ISO format for dates
          ssn: "444-55-6666",
          gender: "male",
          relationship: "child"
        },
        {
          name: "Test Child 3",
          dob: "2014-09-23", // ISO format for dates
          ssn: "333-44-5555",
          gender: "female",
          relationship: "child"
        },
        {
          name: "Test Child 4",
          dob: "2016-11-12", // ISO format for dates
          ssn: "222-33-4444",
          gender: "male",
          relationship: "child"
        },
        {
          name: "Test Parent",
          dob: "1965-02-28", // ISO format for dates
          ssn: "111-22-3333",
          gender: "male",
          relationship: "parent"
        }
      ],
      billingInformation: {
        sameAsApplicant: false,
        billingAddressLine1: "456 Billing Street",
        billingAddressLine2: "Suite 100",
        billingCity: "Billtown",
        billingState: "NY",
        billingZipCode: "54321", // Should be converted to number
        cardType: "visa",
        cardNumber: "4111111111111111",
        expMonth: "12",
        expYear: "2025",
        cvv: "123" // Should be converted to number
      },
      agentInformation: {
        agentName: "Agent Smith",
        fronterName: "Jane Fronter",
        notes: "Test submission with maximum data for comprehensive Airtable field testing"
      }
    };

    // Set all form values at once
    methods.reset(testData);
    
    // Show confirmation to user
    toast.success("Test data populated successfully! All Airtable fields included with maximum dependents.", {
      description: "Please enter your Lead ID before submitting"
    });
    
    // Scroll to top to see the populated form and enter Lead ID
    window.scrollTo({ top: 0, behavior: 'smooth' });
    
    // Focus on the Lead ID field (requires basic-information component to expose the field)
    setTimeout(() => {
      const leadIdInput = document.querySelector('input[name="basicInformation.leadId"]');
      if (leadIdInput) {
        (leadIdInput as HTMLInputElement).focus();
      }
    }, 100);
  };
  
  // Function to inspect current form data
  const inspectFormData = () => {
    const currentData = methods.getValues();
    console.log('Current form data:', JSON.stringify(currentData, null, 2));
    toast.info("Form data printed to console for inspection", {
      description: "Check your browser's developer console (F12)"
    });
  };

  const sections = [
    { id: "basicInformation", label: "Basic Info", component: BasicInformation },
    { id: "healthInformation", label: "Health", component: HealthInformation },
    { id: "insuranceDetails", label: "Insurance", component: InsuranceDetails },
    { id: "personalDetails", label: "Personal", component: PersonalDetails },
    { id: "contactNumbers", label: "Contact", component: ContactNumbers },
    { id: "addressInformation", label: "Address", component: AddressInformation },
    { id: "dependentsInformation", label: "Dependents", component: DependentsInformation },
    { id: "billingInformation", label: "Billing", component: BillingInformation },
    { id: "agentInformation", label: "Agent", component: AgentInformation },
  ]

  const scrollToSection = (sectionId: string) => {
    setActiveSection(sectionId)
    setTimeout(() => {
      const sectionRef = sectionRefs.current[sectionId]
      if (sectionRef) {
        sectionRef.scrollIntoView({ behavior: 'smooth' })
      }
    }, 100)
  }

  // Use Intersection Observer to track which section is currently in view
  useEffect(() => {
    // Wait for refs to be populated after initial render
    const timer = setTimeout(() => {
      const observers: IntersectionObserver[] = []
      const observerOptions = {
        root: null,
        rootMargin: '-10% 0px -80% 0px',
        threshold: 0
      }

      sections.forEach(section => {
        const sectionRef = sectionRefs.current[section.id]
        if (sectionRef) {
          const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
              if (entry.isIntersecting) {
                setActiveSection(section.id)
              }
            })
          }, observerOptions)

          observer.observe(sectionRef)
          observers.push(observer)
        }
      })

      return () => {
        observers.forEach(observer => observer.disconnect())
      }
    }, 500) // Give time for the DOM to render

    return () => clearTimeout(timer)
  }, [])

  // Scroll to top button
  const [showScrollToTop, setShowScrollToTop] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollToTop(window.scrollY > 300)
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <FormProvider {...methods}>
      <form onSubmit={methods.handleSubmit(handleSubmit)} className="relative pb-20">
        {/* Fixed Navigation Menu */}
        <nav className="sticky top-0 bg-white shadow-md z-50 py-4 border-b border-gray-200">
          <div className="container mx-auto px-4">
            {/* Mobile View - Dropdown */}
            <div className="md:hidden w-full">
              <Select value={activeSection} onValueChange={scrollToSection}>
                <SelectTrigger>
                  <SelectValue>{sections.find(s => s.id === activeSection)?.label || "Select Section"}
                    {activeSection === "basicInformation" && isDebugMode && <span className="ml-2 text-xs">🔍</span>}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {sections.map((section) => (
                    <SelectItem 
                      key={section.id} 
                      value={section.id}
                      onDoubleClick={section.id === "basicInformation" ? toggleDebugMode : undefined}
                    >
                      {section.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Desktop View - Horizontal Menu */}
            <div className="hidden md:flex space-x-4 overflow-x-auto">
              {sections.map((section) => (
                <div
                  key={section.id}
                  className={`px-4 py-2 rounded-md cursor-pointer ${
                    activeSection === section.id ? "bg-primary text-white" : "bg-gray-100 hover:bg-gray-200"
                  } ${section.id === "basicInformation" && isDebugMode ? "ring-2 ring-amber-400" : ""}`}
                  onClick={() => scrollToSection(section.id)}
                  onDoubleClick={section.id === "basicInformation" ? toggleDebugMode : undefined}
                  title={section.id === "basicInformation" ? "Double-click to toggle debug mode" : undefined}
                >
                  {section.label}
                  {section.id === "basicInformation" && isDebugMode && <span className="ml-2 text-xs">🔍</span>}
                </div>
              ))}
            </div>
          </div>
        </nav>

        {/* Form Sections */}
        <div className="container mx-auto pt-8 px-4 space-y-12">
          {sections.map((section) => {
            const SectionComponent = section.component
            return (
              <div 
                key={section.id}
                id={section.id}
                ref={(el) => {
                  sectionRefs.current[section.id] = el;
                  return undefined;
                }}
                className="section-container border rounded-lg p-6 bg-white shadow-sm"
              >
                <h2 className="text-xl font-semibold border-b pb-3 mb-6 text-primary">{section.label}</h2>
                <SectionComponent />
              </div>
            )
          })}
        </div>

        {/* Fixed Submit Button */}
        <div className="sticky bottom-0 bg-white shadow-lg p-4 border-t">
          <div className="container mx-auto flex justify-between">
            {/* Test buttons */}
            <div className="flex space-x-2">
              <Button 
                type="button" 
                onClick={fillTestData}
                data-debug-button
                className={`bg-gray-600 hover:bg-gray-700 px-6 py-2 ${!isDebugMode ? 'hidden' : ''}`}
              >
                Fill Test Data
              </Button>
              
              <Button 
                type="button" 
                onClick={inspectFormData}
                data-debug-button
                className={`bg-blue-600 hover:bg-blue-700 px-6 py-2 ${!isDebugMode ? 'hidden' : ''}`}
              >
                Inspect Data
              </Button>
            </div>
            
            <Button 
              type="submit" 
              className="bg-primary hover:bg-primary/90 px-6 py-2"
            >
              Submit Application
            </Button>
          </div>
        </div>

        {/* Scroll to Top Button */}
        {showScrollToTop && (
          <button
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="fixed bottom-20 right-8 bg-primary text-white p-3 rounded-full shadow-lg"
            aria-label="Scroll to top"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 19V5M5 12l7-7 7 7"/>
            </svg>
          </button>
        )}
      </form>
    </FormProvider>
  )
}

