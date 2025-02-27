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

export default function InsuranceForm() {
  const [activeSection, setActiveSection] = useState("basicInformation")
  const methods = useForm<FormData>()
  const sectionRefs = useRef<Record<string, HTMLDivElement | null>>({})

  const handleSubmit = async (data: FormData) => {
    const { leadId, firstName, lastName } = data.basicInformation || {}

    if (!leadId || !firstName || !lastName) {
      toast.error("Please fill in Lead ID, First Name, and Last Name")
      scrollToSection("basicInformation")
      return
    }

    try {
      await submitToAirtable(data)
      toast.success("Form submitted successfully!")
      methods.reset()
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } catch (error) {
      console.error("Error submitting form:", error)
      toast.error("Failed to submit form. Please try again.")
    }
  }

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
                <SelectTrigger className="w-full">
                  <SelectValue>{sections.find(s => s.id === activeSection)?.label || "Select Section"}</SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {sections.map((section) => (
                    <SelectItem key={section.id} value={section.id}>
                      {section.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Desktop View - Horizontal Menu */}
            <div className="hidden md:flex space-x-4 overflow-x-auto">
              {sections.map((section) => (
                <button
                  key={section.id}
                  type="button"
                  onClick={() => scrollToSection(section.id)}
                  className={`px-4 py-2 text-sm font-medium rounded-md whitespace-nowrap transition-colors
                    ${activeSection === section.id 
                      ? 'bg-primary text-white font-bold' 
                      : 'text-gray-700 hover:bg-gray-100'
                    }`}
                >
                  {section.label}
                </button>
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
          <div className="container mx-auto flex justify-end">
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

