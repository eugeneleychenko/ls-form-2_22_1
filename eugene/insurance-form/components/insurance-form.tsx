"use client"

import { useState } from "react"
import { useForm, FormProvider } from "react-hook-form"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
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
  const [activeTab, setActiveTab] = useState("basicInformation")
  const methods = useForm<FormData>()

  const handleSubmit = async (data: FormData) => {
    const { leadId, firstName, lastName } = data.basicInformation || {}

    if (!leadId || !firstName || !lastName) {
      toast.error("Please fill in Lead ID, First Name, and Last Name")
      setActiveTab("basicInformation")
      return
    }

    try {
      await submitToAirtable(data)
      toast.success("Form submitted successfully!")
      methods.reset()
      setActiveTab("basicInformation")
    } catch (error) {
      console.error("Error submitting form:", error)
      toast.error("Failed to submit form. Please try again.")
    }
  }

  const tabs = [
    { id: "basicInformation", label: "Basic Info" },
    { id: "healthInformation", label: "Health" },
    { id: "insuranceDetails", label: "Insurance" },
    { id: "personalDetails", label: "Personal" },
    { id: "contactNumbers", label: "Contact" },
    { id: "addressInformation", label: "Address" },
    { id: "dependentsInformation", label: "Dependents" },
    { id: "billingInformation", label: "Billing" },
    { id: "agentInformation", label: "Agent" },
  ]

  const currentTab = tabs.find((tab) => tab.id === activeTab)

  return (
    <FormProvider {...methods}>
      <form onSubmit={methods.handleSubmit(handleSubmit)} className="space-y-8">
        <div className="flex justify-end mb-4">
          <Button
            type="submit"
            className="bg-primary hover:bg-primary/90"
          >
            Skip to Submit
          </Button>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          {/* Mobile View - Dropdown */}
          <div className="md:hidden w-full mb-4">
            <Select value={activeTab} onValueChange={setActiveTab}>
              <SelectTrigger className="w-full bg-white">
                <SelectValue>{currentTab?.label || "Select Section"}</SelectValue>
              </SelectTrigger>
              <SelectContent>
                {tabs.map((tab) => (
                  <SelectItem key={tab.id} value={tab.id}>
                    {tab.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Desktop View - Tabs */}
          <div className="hidden md:block w-full">
            <TabsList className="grid grid-cols-3 lg:grid-cols-9 gap-2 bg-gray-100">
              {tabs.map((tab) => (
                <TabsTrigger
                  key={tab.id}
                  value={tab.id}
                  className="text-sm data-[state=active]:bg-primary data-[state=active]:text-white"
                >
                  {tab.label}
                </TabsTrigger>
              ))}
            </TabsList>
          </div>

          {tabs.map((tab) => (
            <TabsContent key={tab.id} value={tab.id}>
              <div className="bg-gray-50 p-6 rounded-lg">
                <h2 className="text-2xl font-semibold text-primary mb-6">{tab.label}</h2>
                {tab.id === "basicInformation" && <BasicInformation />}
                {tab.id === "healthInformation" && <HealthInformation />}
                {tab.id === "insuranceDetails" && <InsuranceDetails />}
                {tab.id === "personalDetails" && <PersonalDetails />}
                {tab.id === "contactNumbers" && <ContactNumbers />}
                {tab.id === "addressInformation" && <AddressInformation />}
                {tab.id === "dependentsInformation" && <DependentsInformation />}
                {tab.id === "billingInformation" && <BillingInformation />}
                {tab.id === "agentInformation" && <AgentInformation />}
              </div>
            </TabsContent>
          ))}
        </Tabs>

        <div className="flex justify-between">
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              const currentIndex = tabs.findIndex((tab) => tab.id === activeTab)
              if (currentIndex > 0) {
                setActiveTab(tabs[currentIndex - 1].id)
              }
            }}
            disabled={activeTab === tabs[0].id}
            className="border-primary text-primary hover:bg-primary hover:text-white"
          >
            Previous
          </Button>
          <Button
            type={activeTab === tabs[tabs.length - 1].id ? "submit" : "button"}
            onClick={() => {
              const currentIndex = tabs.findIndex((tab) => tab.id === activeTab)
              if (currentIndex < tabs.length - 1) {
                setActiveTab(tabs[currentIndex + 1].id)
              }
            }}
            className="bg-primary hover:bg-primary/90"
          >
            {activeTab === tabs[tabs.length - 1].id ? "Submit" : "Next"}
          </Button>
        </div>
      </form>
    </FormProvider>
  )
}

