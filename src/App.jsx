import React, { useState, useEffect } from "react";
import {
  Phone,
  Clock,
  MapPin,
  Sparkles,
  Home,
  Building2,
  User,
  Check,
  X,
  Star,
} from "lucide-react";

const VivifySpaWebsite = () => {
  const [emailJsReady, setEmailJsReady] = useState(false);
  const [selectedService, setSelectedService] = useState("");
  const [serviceType, setServiceType] = useState("studio");
  const [therapistGender, setTherapistGender] = useState("");
  const [duration, setDuration] = useState("");
  const [appointmentDate, setAppointmentDate] = useState("");
  const [appointmentTime, setAppointmentTime] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [paymentOption, setPaymentOption] = useState("full");
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [bookingDetails, setBookingDetails] = useState(null);
  const [redirectCountdown, setRedirectCountdown] = useState(5);

  // Paystack LIVE configuration
  const PAYSTACK_LIVE_PUBLIC_KEY =
    "pk_live_915663b76742c16f999c99e6251596ee7c5c9584";

  // Your booking website URL
  const BOOKING_WEBSITE_URL = "https://vivifymassageandspa.online";

  const services = [
    {
      id: "swedish",
      name: "Swedish Relaxation",
      description:
        "Gentle, flowing strokes to promote relaxation and improve circulation. Best for stress relief",
      image:
        "https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=400&h=300&fit=crop",
      badge: "Popular",
    },
    {
      id: "deep-tissue",
      name: "Deep Tissue Recovery",
      description:
        "Targeted pressure to release chronic muscle tension. Ideal for inflammation and injury recovery",
      image:
        "https://images.unsplash.com/photo-1519823551278-64ac92734fb1?w=400&h=300&fit=crop",
      badge: "Standard",
    },
    {
      id: "full-body",
      name: "Full Body Rejuvenation",
      description:
        "A comprehensive head-to-toe treatment combining multiple techniques for total renewal",
      image:
        "https://images.unsplash.com/photo-1600334129128-685c5582fd35?w=400&h=300&fit=crop",
      badge: "Premium",
    },
  ];

  const pricing = {
    studio: { 60: 20000, 90: 30000, 120: 40000 },
    mobile: { 60: 30000, 90: 45000, 120: 60000 },
  };

  const studioTimeSlots = [
    "9:00 AM",
    "10:00 AM",
    "11:00 AM",
    "12:00 PM",
    "1:00 PM",
    "2:00 PM",
    "3:00 PM",
    "4:00 PM",
    "5:00 PM",
    "6:00 PM",
  ];

  const mobileTimeSlots = [
    "7:00 AM",
    "8:00 AM",
    "9:00 AM",
    "10:00 AM",
    "11:00 AM",
    "12:00 PM",
    "1:00 PM",
    "2:00 PM",
    "3:00 PM",
    "4:00 PM",
    "5:00 PM",
    "6:00 PM",
    "7:00 PM",
    "8:00 PM",
    "9:00 PM",
    "10:00 PM",
    "11:00 PM",
    "12:00 AM",
  ];

  useEffect(() => {
    // Load EmailJS
    const script = document.createElement("script");
    script.src =
      "https://cdn.jsdelivr.net/npm/@emailjs/browser@3/dist/email.min.js";
    script.async = true;
    script.onload = () => {
      window.emailjs.init("0n5VR5rLZ4B0HrtlN");
      setEmailJsReady(true);
      console.log("✅ EmailJS loaded and initialized successfully");
    };
    script.onerror = () => {
      console.error("❌ Failed to load EmailJS script");
    };
    document.body.appendChild(script);

    // Load Paystack inline script
    const paystackScript = document.createElement("script");
    paystackScript.src = "https://js.paystack.co/v1/inline.js";
    paystackScript.async = true;
    document.head.appendChild(paystackScript);

    return () => {
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
      if (document.head.contains(paystackScript)) {
        document.head.removeChild(paystackScript);
      }
    };
  }, []);

  // Countdown timer for redirect
  useEffect(() => {
    let timer;

    if (showSuccessModal && serviceType === "studio" && bookingDetails) {
      // Define the redirect function inside useEffect
      const redirectToBookingWebsite = () => {
        // Create booking reference
        const bookingRef =
          bookingDetails?.paymentReference || `VMS_${Date.now()}`;

        // Create query parameters for booking details
        const params = new URLSearchParams({
          booking_id: bookingRef,
          customer_name: bookingDetails?.customerName || "",
          customer_phone: bookingDetails?.customerPhone || "",
          service: bookingDetails?.service || "",
          amount: bookingDetails?.paymentAmount || "",
          date: bookingDetails?.appointmentDate || "",
          time: bookingDetails?.appointmentTime || "",
          status: "confirmed",
          source: "booking_portal",
        });

        // Redirect to main website with booking confirmation
        window.location.href = `${BOOKING_WEBSITE_URL}/confirmation?${params.toString()}`;
      };

      timer = setInterval(() => {
        setRedirectCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            redirectToBookingWebsite();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [showSuccessModal, serviceType, bookingDetails, BOOKING_WEBSITE_URL]);

  const scrollToBooking = () => {
    const bookingSection = document.getElementById("booking-section");
    if (bookingSection) {
      bookingSection.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const getTodayDate = () => {
    const today = new Date();
    return today.toISOString().split("T")[0];
  };

  const getMaxDate = () => {
    const maxDate = new Date();
    maxDate.setMonth(maxDate.getMonth() + 3);
    return maxDate.toISOString().split("T")[0];
  };

  const getCurrentPrice = () => {
    if (!duration) return 0;
    return pricing[serviceType][duration];
  };

  const formatPrice = (price) => {
    return `₦${price.toLocaleString()}`;
  };

  const getPaymentAmount = () => {
    const totalPrice = getCurrentPrice();
    if (serviceType === "studio" && paymentOption === "deposit") {
      return totalPrice * 0.5;
    }
    return totalPrice;
  };

  const sendWhatsAppNotification = (bookingData) => {
    const message =
      `*🌟 NEW BOOKING - Vivify Massage & Spa*\n\n` +
      `*Customer Details:*\n` +
      `👤 Name: ${bookingData.customerName}\n` +
      `📱 Phone: ${bookingData.customerPhone}\n\n` +
      `*Service Details:*\n` +
      `💆 Service: ${bookingData.service}\n` +
      `📍 Location: ${bookingData.serviceType}\n` +
      `👥 Therapist: ${bookingData.therapist}\n` +
      `⏱️ Duration: ${bookingData.duration}\n` +
      `📅 Date: ${bookingData.appointmentDate}\n` +
      `🕐 Time: ${bookingData.appointmentTime}\n\n` +
      `*Payment Details:*\n` +
      `💰 Total Amount: ${formatPrice(bookingData.totalAmount)}\n` +
      `💳 Payment Amount: ${formatPrice(bookingData.paymentAmount)}\n` +
      `📝 Payment Type: ${bookingData.paymentType}\n` +
      `✅ Payment Status: ${bookingData.paymentStatus || "Paid"}\n` +
      `🔗 Payment Reference: ${bookingData.paymentReference || "N/A"}`;

    const whatsappNumber = "2347040723894";
    const whatsappLink = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(
      message
    )}`;
    window.open(whatsappLink, "_blank");
  };

  const sendBookingNotification = async (bookingData) => {
    if (!emailJsReady || !window.emailjs) {
      console.error("❌ EmailJS not loaded yet");
      sendWhatsAppNotification(bookingData);
      return;
    }

    console.log("📧 Attempting to send email...");
    console.log("Booking Data:", bookingData);

    try {
      const response = await window.emailjs.send(
        "service_ecto2f3",
        "template_21t9zbr",
        {
          customer_name: bookingData.customerName,
          customer_phone: bookingData.customerPhone,
          service: bookingData.service,
          service_type: bookingData.serviceType,
          therapist: bookingData.therapist,
          duration: bookingData.duration,
          appointment_date: bookingData.appointmentDate,
          appointment_time: bookingData.appointmentTime,
          total_amount: formatPrice(bookingData.totalAmount),
          payment_amount: formatPrice(bookingData.paymentAmount),
          payment_type: bookingData.paymentType,
          payment_status: bookingData.paymentStatus || "Paid",
          payment_reference: bookingData.paymentReference || "N/A",
          booking_date: new Date(bookingData.bookingDate).toLocaleString(),
        }
      );

      console.log("✅ Email sent successfully!", response);
    } catch (error) {
      console.error("❌ Email sending failed:", error);
      sendWhatsAppNotification(bookingData);
    }
  };

  const handlePaystackPayment = (bookingData) => {
    if (!window.PaystackPop) {
      console.error("Paystack script not loaded");
      alert("Payment system is loading. Please try again in a moment.");
      return;
    }

    const handler = window.PaystackPop.setup({
      key: PAYSTACK_LIVE_PUBLIC_KEY,
      email: "customer@vivifymassageandspa.online",
      amount: bookingData.paymentAmount * 100,
      currency: "NGN",
      ref: `VMS_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      metadata: {
        custom_fields: [
          {
            display_name: "Customer Name",
            variable_name: "customer_name",
            value: bookingData.customerName,
          },
          {
            display_name: "Customer Phone",
            variable_name: "customer_phone",
            value: bookingData.customerPhone,
          },
          {
            display_name: "Service",
            variable_name: "service",
            value: bookingData.service,
          },
          {
            display_name: "Date",
            variable_name: "appointment_date",
            value: bookingData.appointmentDate,
          },
          {
            display_name: "Time",
            variable_name: "appointment_time",
            value: bookingData.appointmentTime,
          },
        ],
      },
      callback: function (response) {
        console.log("✅ Payment Successful!", response);

        // Update booking data with payment info
        const updatedBookingData = {
          ...bookingData,
          paymentReference: response.reference,
          paymentStatus: "Paid",
          paymentMethod: "Paystack",
          transactionId: response.transaction,
        };

        // Send notifications
        sendBookingNotification(updatedBookingData);

        // Set booking details and show success modal
        setBookingDetails(updatedBookingData);
        setShowPaymentModal(false);
        setShowSuccessModal(true);

        // Reset countdown
        setRedirectCountdown(5);
      },
      onClose: function () {
        console.log("Payment window closed");
        alert(
          "Payment was cancelled. You can try again or contact support at 07040723894."
        );
      },
    });

    handler.openIframe();
  };

  const handleBooking = async () => {
    if (
      !selectedService ||
      !serviceType ||
      !therapistGender ||
      !duration ||
      !appointmentDate ||
      !appointmentTime ||
      !customerName ||
      !customerPhone
    ) {
      alert("Please fill in all required fields");
      return;
    }

    setIsLoading(true);

    const bookingData = {
      customerName,
      customerPhone,
      service: services.find((s) => s.id === selectedService)?.name,
      serviceType:
        serviceType === "studio" ? "Massage Studio" : "Mobile Service",
      therapist:
        therapistGender === "any"
          ? "No Preference"
          : therapistGender === "male"
          ? "Male"
          : "Female",
      duration: `${duration} minutes`,
      appointmentDate,
      appointmentTime,
      totalAmount: getCurrentPrice(),
      paymentAmount: getPaymentAmount(),
      paymentType:
        serviceType === "studio"
          ? paymentOption === "full"
            ? "Full Payment"
            : "50% Deposit"
          : "Pay After Session",
      bookingDate: new Date().toISOString(),
    };

    // Simulate processing time
    await new Promise((resolve) => setTimeout(resolve, 1500));

    if (serviceType === "studio") {
      setIsLoading(false);
      setBookingDetails(bookingData);
      setShowPaymentModal(true);
      return;
    }

    // For mobile service (pay after session)
    await sendBookingNotification(bookingData);

    setBookingDetails(bookingData);
    setIsLoading(false);
    setShowSuccessModal(true);
    setRedirectCountdown(5);
  };

  const resetForm = () => {
    setSelectedService("");
    setTherapistGender("");
    setDuration("");
    setAppointmentDate("");
    setAppointmentTime("");
    setCustomerName("");
    setCustomerPhone("");
    setPaymentOption("full");
    setBookingDetails(null);
  };

  const closeModal = () => {
    setShowSuccessModal(false);
    setShowPaymentModal(false);
    resetForm();
  };

  const isFormComplete =
    selectedService &&
    serviceType &&
    therapistGender &&
    duration &&
    appointmentDate &&
    appointmentTime &&
    customerName &&
    customerPhone;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Loading Overlay */}
      {isLoading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
          <div className="bg-white rounded-2xl p-8 max-w-sm mx-4 text-center">
            <div className="w-16 h-16 border-4 border-cyan-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              Processing Your Booking
            </h3>
            <p className="text-gray-600">
              Please wait while we confirm your appointment...
            </p>
          </div>
        </div>
      )}

      {/* Payment Modal */}
      {showPaymentModal && bookingDetails && serviceType === "studio" && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 sm:p-8 max-w-md w-full mx-4 animate-[scale-in_0.3s_ease-out]">
            <button
              onClick={() => setShowPaymentModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>

            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">💳</span>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                Complete Payment
              </h3>
              <p className="text-gray-600">
                Pay {paymentOption === "deposit" ? "50% deposit" : "in full"} to
                confirm your booking
              </p>
            </div>

            <div className="bg-gray-50 rounded-xl p-4 mb-6 space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Name:</span>
                <span className="font-semibold text-gray-900">
                  {bookingDetails.customerName}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Service:</span>
                <span className="font-semibold text-gray-900">
                  {bookingDetails.service}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Duration:</span>
                <span className="font-semibold text-gray-900">
                  {bookingDetails.duration}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Date & Time:</span>
                <span className="font-semibold text-gray-900">
                  {bookingDetails.appointmentDate} at{" "}
                  {bookingDetails.appointmentTime}
                </span>
              </div>
              <div className="flex justify-between text-sm border-t pt-3">
                <span className="text-gray-600">Amount to Pay:</span>
                <span className="font-bold text-green-600 text-lg">
                  {formatPrice(bookingDetails.paymentAmount)}
                </span>
              </div>
            </div>

            <button
              onClick={() => handlePaystackPayment(bookingDetails)}
              className="w-full py-4 bg-green-600 text-white rounded-xl font-bold hover:bg-green-700 transition-colors text-lg shadow-lg hover:shadow-xl mb-4"
            >
              💳 Pay with Paystack
            </button>

            <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-xs text-blue-800 font-semibold mb-1">
                🔒 Secure Payment Processing
              </p>
              <p className="text-xs text-blue-600">
                Your payment is securely processed by Paystack. All card details
                are encrypted.
              </p>
            </div>

            <p className="text-xs text-gray-500 text-center mt-4">
              Powered by Paystack • Secure Payment
            </p>
          </div>
        </div>
      )}

      {/* Success Modal with Redirect */}
      {showSuccessModal && bookingDetails && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 sm:p-8 max-w-md w-full mx-4 animate-[scale-in_0.3s_ease-out]">
            <div className="text-center mb-6">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Check className="w-12 h-12 text-green-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                {serviceType === "studio"
                  ? "Payment Confirmed!"
                  : "Booking Confirmed!"}
              </h3>
              <p className="text-gray-600 mb-4">
                {serviceType === "studio"
                  ? "Your payment has been processed successfully!"
                  : "Your appointment has been successfully booked."}
              </p>

              <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                <p className="text-sm text-green-800 font-semibold">
                  ✅{" "}
                  {serviceType === "studio"
                    ? "Payment verified! Redirecting to confirmation page..."
                    : "Booking confirmed! We'll contact you shortly."}
                </p>
              </div>
            </div>

            <div className="bg-gray-50 rounded-xl p-4 mb-6 space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Booking Reference:</span>
                <span className="font-semibold text-gray-900 text-xs">
                  {bookingDetails.paymentReference ||
                    `VMS_${Date.now().toString().slice(-8)}`}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Name:</span>
                <span className="font-semibold text-gray-900">
                  {bookingDetails.customerName}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Service:</span>
                <span className="font-semibold text-gray-900">
                  {bookingDetails.service}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Date & Time:</span>
                <span className="font-semibold text-gray-900">
                  {bookingDetails.appointmentDate} at{" "}
                  {bookingDetails.appointmentTime}
                </span>
              </div>
              <div className="flex justify-between text-sm border-t pt-3">
                <span className="text-gray-600">
                  Amount {serviceType === "studio" ? "Paid" : "Due"}:
                </span>
                <span className="font-bold text-cyan-600 text-lg">
                  {formatPrice(bookingDetails.paymentAmount)}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Status:</span>
                <span className="font-semibold text-green-600">
                  {serviceType === "studio" ? "Paid ✓" : "Confirmed"}
                </span>
              </div>
            </div>

            {serviceType === "studio" && (
              <div className="mb-6 text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-100 rounded-full mb-3">
                  <span className="text-2xl">⏱️</span>
                </div>
                <p className="text-sm text-gray-600 mb-2">
                  Redirecting to confirmation page in:
                </p>
                <div className="text-3xl font-bold text-blue-600 mb-3">
                  {redirectCountdown} seconds
                </div>
                <button
                  onClick={() => {
                    const params = new URLSearchParams({
                      booking_id:
                        bookingDetails.paymentReference || `VMS_${Date.now()}`,
                      customer_name: bookingDetails.customerName,
                      status: "confirmed",
                    });
                    window.location.href = `${BOOKING_WEBSITE_URL}/confirmation?${params.toString()}`;
                  }}
                  className="w-full py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors mb-2"
                >
                  Go to Confirmation Page Now
                </button>
                <button
                  onClick={closeModal}
                  className="w-full py-3 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
                >
                  Stay Here
                </button>
              </div>
            )}

            {serviceType === "mobile" && (
              <div className="mb-6">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                  <div className="flex items-center justify-center mb-2">
                    <Phone className="w-5 h-5 text-blue-600 mr-2" />
                    <p className="text-sm text-blue-800 font-semibold">
                      Our team will contact you shortly
                    </p>
                  </div>
                  <p className="text-xs text-blue-600 text-center">
                    Payment will be collected after your session.
                  </p>
                </div>
                <button
                  onClick={closeModal}
                  className="w-full py-3 bg-cyan-400 text-white rounded-lg font-semibold hover:bg-cyan-500 transition-colors"
                >
                  Done
                </button>
              </div>
            )}

            <p className="text-xs text-gray-500 text-center">
              {serviceType === "studio"
                ? `You will be redirected automatically`
                : "Keep your booking reference for future reference"}
            </p>
          </div>
        </div>
      )}

      <style>{`
        @keyframes scale-in {
          from {
            opacity: 0;
            transform: scale(0.9);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
      `}</style>

      <header className="bg-white shadow-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-cyan-400 rounded-lg flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-gray-800">
                  Vivify Massage & Spa
                </h1>
              </div>
            </div>
            <button
              onClick={scrollToBooking}
              className="bg-cyan-400 text-white px-4 sm:px-6 py-2 rounded-lg hover:bg-cyan-500 transition-colors font-semibold text-sm sm:text-base"
            >
              Book Now
            </button>
          </div>
        </div>
      </header>

      <section className="bg-gradient-to-br from-gray-100 to-gray-200 py-12 sm:py-20 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-64 sm:w-96 h-64 sm:h-96 bg-gray-300 rounded-full -translate-x-1/2 -translate-y-1/2 opacity-30"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <div className="inline-block bg-cyan-100 text-cyan-600 px-4 py-1 rounded-full text-xs sm:text-sm font-semibold mb-4 sm:mb-6">
            PREMIUM RELAXATION EXPERIENCE
          </div>
          <h2 className="text-3xl sm:text-5xl md:text-6xl font-bold text-gray-900 mb-4">
            Find Your
            <br />
            <span className="text-cyan-400">Perfect Balance</span>
          </h2>
          <p className="text-base sm:text-lg text-gray-600 max-w-2xl mx-auto px-4 mb-6">
            Experience world-class massage therapy in our downtown sanctuary or
            the comfort of your own home. Book your personalized session today.
          </p>
        </div>
      </section>

      <section
        id="booking-section"
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-16"
      >
        <div className="grid lg:grid-cols-3 gap-6 sm:gap-8">
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-sm p-4 sm:p-8">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-xl sm:text-2xl font-bold text-gray-900">
                    Customize Session
                  </h3>
                </div>
                <div className="text-xs bg-gray-100 text-gray-600 px-3 py-1 rounded-full">
                  Step-by-step
                </div>
              </div>
              <p className="text-sm sm:text-base text-gray-600 mb-6 sm:mb-8">
                Design your perfect relaxation experience in simple steps
              </p>

              <div className="mb-6 sm:mb-8">
                <div className="flex items-center mb-4">
                  <div className="w-7 h-7 sm:w-8 sm:h-8 bg-cyan-400 text-white rounded-full flex items-center justify-center font-bold mr-3 text-sm sm:text-base">
                    1
                  </div>
                  <h4 className="text-base sm:text-lg font-bold text-gray-900">
                    Select Location
                  </h4>
                </div>
                <div className="grid sm:grid-cols-2 gap-3 sm:gap-4">
                  <div
                    onClick={() => setServiceType("studio")}
                    className={`p-4 sm:p-6 rounded-xl cursor-pointer transition-all border-2 ${
                      serviceType === "studio"
                        ? "border-cyan-400 bg-cyan-50"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h5 className="font-bold text-gray-900 mb-1 text-sm sm:text-base">
                          Massage Studio
                        </h5>
                        <p className="text-xs sm:text-sm text-gray-600 mb-2">
                          <Building2 className="w-3 h-3 sm:w-4 sm:h-4 inline mr-1" />
                          Our Private Home Studio
                        </p>
                        <p className="text-xs text-cyan-600 font-semibold">
                          💳 Secure online payment required
                        </p>
                      </div>
                      {serviceType === "studio" && (
                        <Check className="w-4 h-4 sm:w-5 sm:h-5 text-cyan-400" />
                      )}
                    </div>
                  </div>
                  <div
                    onClick={() => setServiceType("mobile")}
                    className={`p-4 sm:p-6 rounded-xl cursor-pointer transition-all border-2 ${
                      serviceType === "mobile"
                        ? "border-cyan-400 bg-cyan-50"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h5 className="font-bold text-gray-900 mb-1 text-sm sm:text-base">
                          Mobile Service
                        </h5>
                        <p className="text-xs sm:text-sm text-gray-600 mb-2">
                          <Home className="w-3 h-3 sm:w-4 sm:h-4 inline mr-1" />
                          Your Home or Hotel (Your Location)
                        </p>
                        <p className="text-xs text-cyan-600 font-semibold">
                          💰 Pay after session
                        </p>
                      </div>
                      {serviceType === "mobile" && (
                        <Check className="w-4 h-4 sm:w-5 sm:h-5 text-cyan-400" />
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className="mb-6 sm:mb-8">
                <div className="flex items-center mb-4">
                  <div className="w-7 h-7 sm:w-8 sm:h-8 bg-gray-200 text-gray-700 rounded-full flex items-center justify-center font-bold mr-3 text-sm sm:text-base">
                    2
                  </div>
                  <h4 className="text-base sm:text-lg font-bold text-gray-900">
                    Choose Therapy
                  </h4>
                </div>
                <div className="space-y-3">
                  {services.map((service) => (
                    <div
                      key={service.id}
                      onClick={() => setSelectedService(service.id)}
                      className={`p-3 sm:p-4 rounded-xl cursor-pointer transition-all border-2 flex items-start ${
                        selectedService === service.id
                          ? "border-cyan-400 bg-cyan-50"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      <img
                        src={service.image}
                        alt={service.name}
                        className="w-16 h-16 sm:w-20 sm:h-20 rounded-lg object-cover mr-3 sm:mr-4 flex-shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between flex-wrap gap-2">
                          <h5 className="font-bold text-gray-900 text-sm sm:text-base">
                            {service.name}
                          </h5>
                          <span
                            className={`text-xs px-2 py-1 rounded ${
                              service.badge === "Popular"
                                ? "bg-green-100 text-green-700"
                                : service.badge === "Standard"
                                ? "bg-orange-100 text-orange-700"
                                : "bg-purple-100 text-purple-700"
                            }`}
                          >
                            {service.badge}
                          </span>
                        </div>
                        <p className="text-xs sm:text-sm text-gray-600 mt-1">
                          {service.description}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mb-6 sm:mb-8">
                <div className="flex items-center mb-4">
                  <div className="w-7 h-7 sm:w-8 sm:h-8 bg-gray-200 text-gray-700 rounded-full flex items-center justify-center font-bold mr-3 text-sm sm:text-base">
                    3
                  </div>
                  <h4 className="text-base sm:text-lg font-bold text-gray-900">
                    Therapist Preference
                  </h4>
                </div>
                <div className="grid grid-cols-3 gap-2 sm:gap-3">
                  {["any", "female", "male"].map((gender) => (
                    <button
                      key={gender}
                      onClick={() => setTherapistGender(gender)}
                      className={`p-3 sm:p-4 rounded-xl transition-all border-2 ${
                        therapistGender === gender
                          ? "border-cyan-400 bg-cyan-50"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      <User className="w-5 h-5 sm:w-6 sm:h-6 mx-auto mb-2 text-gray-600" />
                      <p className="text-xs sm:text-sm font-semibold text-gray-900">
                        {gender === "any"
                          ? "No Preference"
                          : gender === "female"
                          ? "Female Therapist"
                          : "Male Therapist"}
                      </p>
                      <p className="text-xs text-gray-500 mt-1 hidden sm:block">
                        {gender === "any"
                          ? "Earliest Available"
                          : "Specific Request"}
                      </p>
                    </button>
                  ))}
                </div>
              </div>

              <div className="mb-6 sm:mb-8">
                <div className="flex items-center mb-4">
                  <div className="w-7 h-7 sm:w-8 sm:h-8 bg-gray-200 text-gray-700 rounded-full flex items-center justify-center font-bold mr-3 text-sm sm:text-base">
                    4
                  </div>
                  <h4 className="text-base sm:text-lg font-bold text-gray-900">
                    Session Duration
                  </h4>
                </div>
                <div className="grid grid-cols-3 gap-2 sm:gap-3">
                  {[60, 90, 120].map((mins) => (
                    <div
                      key={mins}
                      onClick={() => setDuration(mins)}
                      className={`p-3 sm:p-4 rounded-xl cursor-pointer transition-all border-2 text-center ${
                        duration === mins
                          ? "border-cyan-400 bg-cyan-50"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      {duration === mins && (
                        <span className="text-xs bg-cyan-400 text-white px-2 py-1 rounded mb-2 inline-block">
                          SELECTED
                        </span>
                      )}
                      <div className="text-2xl sm:text-3xl font-bold text-gray-900">
                        {mins}
                      </div>
                      <div className="text-xs sm:text-sm text-gray-600 mb-1">
                        MINUTES
                      </div>
                      <div className="text-xs sm:text-sm font-semibold text-cyan-600">
                        {formatPrice(pricing[serviceType][mins])}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mb-6 sm:mb-8">
                <div className="flex items-center mb-4">
                  <div className="w-7 h-7 sm:w-8 sm:h-8 bg-gray-200 text-gray-700 rounded-full flex items-center justify-center font-bold mr-3 text-sm sm:text-base">
                    5
                  </div>
                  <h4 className="text-base sm:text-lg font-bold text-gray-900">
                    Select Date
                  </h4>
                </div>
                <div className="p-4 sm:p-6 rounded-xl border-2 border-cyan-400 bg-cyan-50">
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    Choose your appointment date
                  </label>
                  <input
                    type="date"
                    value={appointmentDate}
                    onChange={(e) => setAppointmentDate(e.target.value)}
                    min={getTodayDate()}
                    max={getMaxDate()}
                    className="w-full p-3 border-2 border-gray-200 rounded-lg text-center font-semibold text-sm sm:text-base focus:border-cyan-400 focus:outline-none"
                  />
                  <p className="text-xs text-gray-600 mt-2 text-center">
                    Available up to 3 months in advance
                  </p>
                </div>
              </div>

              <div className="mb-6 sm:mb-8">
                <div className="flex items-center mb-4">
                  <div className="w-7 h-7 sm:w-8 sm:h-8 bg-gray-200 text-gray-700 rounded-full flex items-center justify-center font-bold mr-3 text-sm sm:text-base">
                    6
                  </div>
                  <h4 className="text-base sm:text-lg font-bold text-gray-900">
                    Select Time
                  </h4>
                </div>
                {serviceType === "mobile" ? (
                  <div>
                    <div className="p-4 sm:p-6 rounded-xl border-2 border-cyan-400 bg-cyan-50 text-center mb-4">
                      <Clock className="w-8 h-8 sm:w-10 sm:h-10 mx-auto mb-3 text-cyan-600" />
                      <h5 className="font-bold text-gray-900 mb-1 text-sm sm:text-base">
                        Extended Hours
                      </h5>
                      <p className="text-xs sm:text-sm text-gray-600">
                        Mobile service available 7 AM - 12 AM
                      </p>
                    </div>
                    <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                      {mobileTimeSlots.map((time) => (
                        <button
                          key={time}
                          onClick={() => setAppointmentTime(time)}
                          className={`p-2 sm:p-3 rounded-lg transition-all border-2 text-xs sm:text-sm font-semibold ${
                            appointmentTime === time
                              ? "border-cyan-400 bg-cyan-400 text-white"
                              : "border-gray-200 hover:border-gray-300 text-gray-700"
                          }`}
                        >
                          {time}
                        </button>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                    {studioTimeSlots.map((time) => (
                      <button
                        key={time}
                        onClick={() => setAppointmentTime(time)}
                        className={`p-2 sm:p-3 rounded-lg transition-all border-2 text-xs sm:text-sm font-semibold ${
                          appointmentTime === time
                            ? "border-cyan-400 bg-cyan-400 text-white"
                            : "border-gray-200 hover:border-gray-300 text-gray-700"
                        }`}
                      >
                        {time}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className="mb-6 sm:mb-8">
                <div className="flex items-center mb-4">
                  <div className="w-7 h-7 sm:w-8 sm:h-8 bg-gray-200 text-gray-700 rounded-full flex items-center justify-center font-bold mr-3 text-sm sm:text-base">
                    7
                  </div>
                  <h4 className="text-base sm:text-lg font-bold text-gray-900">
                    Your Information
                  </h4>
                </div>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      placeholder="Enter your full name"
                      className="w-full p-3 border-2 border-gray-200 rounded-lg focus:border-cyan-400 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Phone Number *
                    </label>
                    <input
                      type="tel"
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      placeholder="080XXXXXXXX"
                      className="w-full p-3 border-2 border-gray-200 rounded-lg focus:border-cyan-400 focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {serviceType === "studio" && (
                <div>
                  <div className="flex items-center mb-4">
                    <div className="w-7 h-7 sm:w-8 sm:h-8 bg-gray-200 text-gray-700 rounded-full flex items-center justify-center font-bold mr-3 text-sm sm:text-base">
                      8
                    </div>
                    <h4 className="text-base sm:text-lg font-bold text-gray-900">
                      Payment Option
                    </h4>
                  </div>
                  <div className="grid sm:grid-cols-2 gap-3">
                    <div
                      onClick={() => setPaymentOption("full")}
                      className={`p-4 rounded-xl cursor-pointer transition-all border-2 ${
                        paymentOption === "full"
                          ? "border-cyan-400 bg-cyan-50"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h5 className="font-bold text-gray-900 mb-1">
                            Pay in Full
                          </h5>
                          <p className="text-xs text-gray-600 mb-2">
                            Complete payment now
                          </p>
                          <p className="text-lg font-bold text-cyan-600">
                            {formatPrice(getCurrentPrice())}
                          </p>
                        </div>
                        {paymentOption === "full" && (
                          <Check className="w-5 h-5 text-cyan-400" />
                        )}
                      </div>
                    </div>
                    <div
                      onClick={() => setPaymentOption("deposit")}
                      className={`p-4 rounded-xl cursor-pointer transition-all border-2 ${
                        paymentOption === "deposit"
                          ? "border-cyan-400 bg-cyan-50"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h5 className="font-bold text-gray-900 mb-1">
                            50% Deposit
                          </h5>
                          <p className="text-xs text-gray-600 mb-2">
                            Pay remaining at studio
                          </p>
                          <p className="text-lg font-bold text-cyan-600">
                            {formatPrice(getCurrentPrice() * 0.5)}
                          </p>
                        </div>
                        {paymentOption === "deposit" && (
                          <Check className="w-5 h-5 text-cyan-400" />
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-xs text-blue-800">
                      💳 Secure online payment required for studio bookings.
                      Powered by Paystack.
                    </p>
                  </div>
                </div>
              )}

              {serviceType === "mobile" && (
                <div>
                  <div className="flex items-center mb-4">
                    <div className="w-7 h-7 sm:w-8 sm:h-8 bg-gray-200 text-gray-700 rounded-full flex items-center justify-center font-bold mr-3 text-sm sm:text-base">
                      8
                    </div>
                    <h4 className="text-base sm:text-lg font-bold text-gray-900">
                      Payment Method
                    </h4>
                  </div>
                  <div className="p-4 rounded-xl border-2 border-green-400 bg-green-50">
                    <h5 className="font-bold text-gray-900 mb-1">
                      Pay After Session
                    </h5>
                    <p className="text-sm text-gray-600">
                      Payment due upon completion of mobile service
                    </p>
                  </div>
                </div>
              )}
            </div>

            <div className="lg:hidden mt-6 bg-white rounded-2xl shadow-sm p-4 sm:p-6">
              <div className="flex items-center mb-4">
                <div className="w-7 h-7 sm:w-8 sm:h-8 bg-cyan-400 text-white rounded-full flex items-center justify-center font-bold mr-3 text-sm sm:text-base">
                  9
                </div>
                <h4 className="text-base sm:text-lg font-bold text-gray-900">
                  Review & Confirm
                </h4>
              </div>
              {isFormComplete ? (
                <>
                  <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-4">
                    <p className="text-xs sm:text-sm text-green-700 font-semibold">
                      ✓ FORM COMPLETED
                    </p>
                  </div>
                  <div className="border-t pt-4 mb-4">
                    <div className="space-y-2 mb-3">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">
                          Session ({duration} min)
                        </span>
                        <span className="font-semibold">
                          {formatPrice(getCurrentPrice())}
                        </span>
                      </div>
                      {serviceType === "studio" &&
                        paymentOption === "deposit" && (
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">
                              Paying Now (50%)
                            </span>
                            <span className="font-semibold text-cyan-600">
                              {formatPrice(getPaymentAmount())}
                            </span>
                          </div>
                        )}
                    </div>
                    <div className="flex justify-between items-center pt-3 border-t">
                      <span className="text-base sm:text-lg font-bold text-gray-900">
                        {serviceType === "studio" && paymentOption === "deposit"
                          ? "Pay Now"
                          : serviceType === "studio"
                          ? "Pay Now"
                          : "Total Due"}
                      </span>
                      <span className="text-2xl sm:text-3xl font-bold text-cyan-400">
                        {formatPrice(getPaymentAmount())}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 text-right mt-1">
                      *Tax included
                    </p>
                  </div>
                  <button
                    onClick={handleBooking}
                    className="w-full py-3 rounded-lg font-semibold transition-all bg-cyan-400 text-white hover:bg-cyan-500"
                  >
                    {serviceType === "studio"
                      ? "Proceed to Payment →"
                      : "Confirm Booking →"}
                  </button>
                  <p className="text-xs text-gray-500 text-center mt-3">
                    {serviceType === "studio"
                      ? "Secure payment via Paystack"
                      : "Pay after session"}
                  </p>
                </>
              ) : (
                <div className="bg-gray-50 rounded-lg p-4 text-center">
                  <p className="text-sm text-gray-600">
                    Complete all sections above to review your booking
                  </p>
                </div>
              )}
            </div>
          </div>

          <div className="hidden lg:block lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-sm p-6 sticky top-24">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center">
                  <div className="w-5 h-5 bg-cyan-400 rounded mr-2"></div>
                  <h4 className="font-bold text-gray-900">Booking Summary</h4>
                </div>
              </div>
              <div className="space-y-4 mb-6">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">
                    {selectedService
                      ? services.find((s) => s.id === selectedService)?.name
                      : "Select service"}
                  </span>
                  <span className="font-semibold text-gray-900">
                    {selectedService && duration
                      ? formatPrice(getCurrentPrice())
                      : "-"}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">
                    {serviceType === "studio"
                      ? "Massage Studio"
                      : "Mobile Service"}
                  </span>
                  <span className="font-semibold text-gray-900">
                    {formatPrice(0)}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Duration</span>
                  <span className="text-gray-500">
                    {duration ? `${duration} minutes` : "-"}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Therapist</span>
                  <span className="text-gray-500">
                    {therapistGender === "male"
                      ? "Male"
                      : therapistGender === "female"
                      ? "Female"
                      : therapistGender === "any"
                      ? "Any"
                      : "-"}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Date</span>
                  <span className="text-gray-500">
                    {appointmentDate || "-"}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Time</span>
                  <span className="text-gray-500">
                    {appointmentTime || "-"}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Name</span>
                  <span className="text-gray-500">{customerName || "-"}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Phone</span>
                  <span className="text-gray-500">{customerPhone || "-"}</span>
                </div>
              </div>
              <div className="border-t pt-4 mb-6">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-bold text-gray-900">
                    {serviceType === "studio" && paymentOption === "deposit"
                      ? "Pay Now (50%)"
                      : serviceType === "studio"
                      ? "Pay Now"
                      : "Total Amount"}
                  </span>
                  <span className="text-3xl font-bold text-cyan-400">
                    {duration ? formatPrice(getPaymentAmount()) : "-"}
                  </span>
                </div>
                <p className="text-xs text-gray-500 text-right mt-1">
                  *Includes all taxes & fees
                </p>
              </div>
              <button
                onClick={handleBooking}
                disabled={!isFormComplete}
                className={`w-full py-3 rounded-lg font-semibold transition-all ${
                  isFormComplete
                    ? "bg-cyan-400 text-white hover:bg-cyan-500"
                    : "bg-gray-200 text-gray-400 cursor-not-allowed"
                }`}
              >
                {serviceType === "studio"
                  ? "Proceed to Payment →"
                  : "Confirm Booking →"}
              </button>
              <p className="text-xs text-gray-500 text-center mt-3">
                {serviceType === "studio"
                  ? "Secure payment via Paystack"
                  : "Pay after session"}
              </p>

              {/* Security Indicator */}
              <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-xs text-green-800 font-semibold">
                  🔒 Secure Payment Processing
                </p>
                <p className="text-xs text-green-600 mt-1">
                  All transactions are encrypted and secure.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-white py-12 sm:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8 sm:mb-12">
            <h3 className="text-2xl sm:text-3xl font-bold text-gray-900">
              What Our Clients Say
            </h3>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {[
              {
                name: "Abu M.",
                text: "Absolutely the best massage I've had in the city. The studio is so calming and clean.",
                rating: 5,
              },
              {
                name: "Adeola O.",
                text: "The mobile service was game changing. A professional massage at home feels pure luxury.",
                rating: 5,
              },
              {
                name: "Kareem J.",
                text: "Deep tissue work that actually fixed my back pain. Highly professional staff!",
                rating: 5,
              },
            ].map((testimonial, idx) => (
              <div key={idx} className="bg-gray-50 rounded-2xl p-6 text-center">
                <div className="w-16 h-16 bg-gray-300 rounded-full mx-auto mb-4"></div>
                <div className="flex justify-center mb-3">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <span key={i} className="text-yellow-400 text-lg">
                      ★
                    </span>
                  ))}
                </div>
                <p className="text-sm sm:text-base text-gray-600 mb-4 italic">
                  "{testimonial.text}"
                </p>
                <p className="font-semibold text-gray-900">
                  - {testimonial.name}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <footer className="bg-gray-900 text-white py-8 sm:py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 mb-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-cyan-400 rounded-lg flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h4 className="text-xl font-bold">Vivify Massage & Spa</h4>
                </div>
              </div>
              <p className="text-gray-400">
                Your sanctuary for relaxation and rejuvenation. Book online or
                call us today.
              </p>
            </div>
            <div>
              <h4 className="text-xl font-bold mb-4">Contact</h4>
              <div className="space-y-3 text-gray-400">
                <div className="flex items-start">
                  <Phone className="w-5 h-5 mr-3 mt-1 text-cyan-400" />
                  <div>
                    <p className="font-semibold text-white">07040723894</p>
                    <p className="text-sm">Available for bookings</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <MapPin className="w-5 h-5 mr-3 mt-1 text-cyan-400" />
                  <div>
                    <p className="font-semibold text-white">Location</p>
                    <p className="text-sm">
                      Ewa Block Industry, Alao Farm
                      <br />
                      Tanke Akata.
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <div>
              <h4 className="text-xl font-bold mb-4">Hours</h4>
              <div className="space-y-2 text-gray-400">
                <div className="flex justify-between">
                  <span>Studio:</span>
                  <span className="text-white font-semibold">
                    9:00 AM - 6:00 PM
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Mobile:</span>
                  <span className="text-white font-semibold">24/7</span>
                </div>
                <p className="text-sm mt-2">We're here whenever you need us</p>
              </div>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-8 text-center text-gray-400">
            <p>&copy; 2024 Vivify Massage & Spa. All rights reserved.</p>
            <p className="text-sm mt-2">Payment processing by Paystack</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default VivifySpaWebsite;
