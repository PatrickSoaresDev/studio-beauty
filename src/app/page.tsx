"use client";

import { BookingContactForm } from "@/components/booking/booking-contact-form";
import { BookingDateTimePanel } from "@/components/booking/booking-date-time-panel";
import { BookingHomeFooter } from "@/components/booking/booking-home-footer";
import { BookingHomeHeader } from "@/components/booking/booking-home-header";
import { BookingServiceSection } from "@/components/booking/booking-service-section";
import { BookingSuccessScreen } from "@/components/booking/booking-success-screen";
import { useBookingFlow } from "@/hooks/use-booking-flow";

export default function Home() {
  const flow = useBookingFlow();

  if (flow.bookingStatus === "success") {
    return (
      <BookingSuccessScreen
        selectedService={flow.selectedService}
        selectedDate={flow.selectedDate}
        selectedTime={flow.selectedTime}
        onNewBooking={flow.resetAfterSuccess}
      />
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-12 font-sans selection:bg-rose-200">
      <BookingHomeHeader />

      <main className="max-w-4xl mx-auto px-4 -mt-16">
        <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-slate-100 flex flex-col">
          <BookingServiceSection
            services={flow.services}
            loadingServices={flow.loadingServices}
            selectedServiceId={flow.selectedServiceId}
            onSelectService={flow.selectService}
          />

          <div className="flex flex-col md:flex-row">
            <BookingDateTimePanel
              today={flow.today}
              serviceChosen={flow.serviceChosen}
              selectedService={flow.selectedService}
              selectedDate={flow.selectedDate}
              onSelectDateFromCalendar={flow.onSelectDateFromCalendar}
              dateHasSlots={flow.dateHasSlots}
              noSlotsForSelectedDate={flow.noSlotsForSelectedDate}
              loadingTimes={flow.loadingTimes}
              availableTimes={flow.availableTimes}
              morningSlots={flow.morningSlots}
              afternoonSlots={flow.afternoonSlots}
              selectedTime={flow.selectedTime}
              onSelectTime={flow.setSelectedTime}
            />

            <BookingContactForm
              formData={flow.formData}
              onFormChange={flow.setFormData}
              onSubmit={flow.handleSubmit}
              serviceChosen={flow.serviceChosen}
              selectedService={flow.selectedService}
              selectedDate={flow.selectedDate}
              selectedTime={flow.selectedTime}
              bookingStatus={flow.bookingStatus}
              errorMessage={flow.errorMessage}
              submitBlockedReason={flow.submitBlockedReason}
            />
          </div>
        </div>
      </main>

      <BookingHomeFooter />
    </div>
  );
}
