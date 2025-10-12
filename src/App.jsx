import React from "react";

export default function App() {
  return (
    <div className="relative flex h-auto min-h-screen w-full flex-col overflow-x-hidden bg-[#f6f8f7] dark:bg-[#11211c] font-sans text-[#36454F] dark:text-[#f5f1e8]">
      <div className="layout-container flex h-full grow flex-col">
        <div className="flex flex-1 justify-center">
          <div className="layout-content-container flex flex-col max-w-[1280px] flex-1">
            {/* Header */}
            <header className="sticky top-0 z-50 flex items-center justify-between whitespace-nowrap border-b border-solid border-b-[#f5f1e8]/50 dark:border-b-[#36454F]/20 px-4 sm:px-6 lg:px-10 py-3 sm:py-4 bg-[#f6f8f7]/80 dark:bg-[#11211c]/80 backdrop-blur-sm">
              <div className="flex items-center gap-2 sm:gap-4 text-[#36454F] dark:text-[#f5f1e8]">
                <div className="size-5 sm:size-6">
                  <svg
                    fill="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-2-3.5l6-4.5-6-4.5v9z"></path>
                  </svg>
                </div>
                <h2 className="font-serif text-base sm:text-lg lg:text-xl font-bold leading-tight tracking-[-0.015em]">
                  Vivify Massage and Spa
                </h2>
              </div>
              <div className="flex flex-1 justify-end gap-4 sm:gap-8">
                <div className="hidden md:flex items-center gap-4 lg:gap-9">
                  <a
                    className="text-[#36454F] dark:text-[#f5f1e8] text-xs lg:text-sm font-medium leading-normal hover:text-[#a3b8a3] dark:hover:text-[#d8b2a9] transition-colors"
                    href="#home"
                  >
                    Home
                  </a>
                  <a
                    className="text-[#36454F] dark:text-[#f5f1e8] text-xs lg:text-sm font-medium leading-normal hover:text-[#a3b8a3] dark:hover:text-[#d8b2a9] transition-colors"
                    href="#services"
                  >
                    Services
                  </a>
                  <a
                    className="text-[#36454F] dark:text-[#f5f1e8] text-xs lg:text-sm font-medium leading-normal hover:text-[#a3b8a3] dark:hover:text-[#d8b2a9] transition-colors"
                    href="#booking"
                  >
                    Booking
                  </a>
                  <a
                    className="text-[#36454F] dark:text-[#f5f1e8] text-xs lg:text-sm font-medium leading-normal hover:text-[#a3b8a3] dark:hover:text-[#d8b2a9] transition-colors"
                    href="#about"
                  >
                    About
                  </a>
                  <a
                    className="text-[#36454F] dark:text-[#f5f1e8] text-xs lg:text-sm font-medium leading-normal hover:text-[#a3b8a3] dark:hover:text-[#d8b2a9] transition-colors"
                    href="#contact"
                  >
                    Contact
                  </a>
                </div>
                <a
                  className="flex min-w-[70px] sm:min-w-[84px] cursor-pointer items-center justify-center overflow-hidden rounded-xl h-8 sm:h-10 px-3 sm:px-4 bg-[#a3b8a3] text-white text-xs sm:text-sm font-bold leading-normal tracking-[0.015em] hover:bg-[#a3b8a3]/90 transition-colors"
                  href="https://vivifymassageandspa.setmore.com"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <span className="truncate">Book Now</span>
                </a>
              </div>
            </header>

            <main className="flex-grow">
              {/* Hero Section */}
              <section id="home">
                <div
                  className="relative min-h-[70vh] sm:min-h-[80vh] lg:min-h-[calc(100vh-80px)] flex flex-col items-center justify-center p-4 sm:p-6 lg:p-8 bg-cover bg-center"
                  style={{
                    backgroundImage:
                      'linear-gradient(rgba(0, 0, 0, 0.3) 0%, rgba(0, 0, 0, 0.5) 100%), url("https://lh3.googleusercontent.com/aida-public/AB6AXuBiudgHGAkLirWJENYwU3KJcrcObR7ZldLqk8IvEa7-63_6iqCspa9LwgIf_C7CKojtVjMIv44XJ-gwTegUdgj-DN6EW_k6g7aXfAWK-z5OyN1y-hRm3Q5Ks30SmukfWw8sdKwv9X5F3pKzuTm0hIstI_9R88-w-9Zn9xM4pk7j5phhaM-lSn33mR9z1n0k6iY3_CO8GyqlP8ZwMlTOu3fT8yjMq1ab0ecmOhUYsFQ63oOrW0iVXfNzQWCbxN6-rWkaU4J1ffYs25PD")',
                  }}
                >
                  <div className="flex flex-col gap-3 sm:gap-4 text-center max-w-4xl mx-auto px-4">
                    <h1 className="text-white font-serif text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold leading-tight tracking-tight">
                      Find Your Inner Peace
                    </h1>
                    <h2 className="text-[#f5f1e8] text-base sm:text-lg md:text-xl font-light leading-normal px-4">
                      Experience the ultimate relaxation and rejuvenation at
                      Vivify Massage and Spa.
                    </h2>
                  </div>
                  <a
                    className="mt-6 sm:mt-8 flex min-w-[140px] sm:min-w-[180px] cursor-pointer items-center justify-center overflow-hidden rounded-xl h-11 sm:h-12 lg:h-14 px-5 sm:px-6 lg:px-8 bg-[#a3b8a3] text-white text-sm sm:text-base lg:text-lg font-bold leading-normal tracking-[0.015em] hover:bg-[#a3b8a3]/90 transition-transform transform hover:scale-105"
                    href="https://vivifymassageandspa.setmore.com"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <span className="truncate">Book an Appointment</span>
                  </a>
                </div>
              </section>

              {/* Services Section */}
              <section
                className="py-12 sm:py-16 lg:py-20 px-4 sm:px-6 lg:px-10 bg-[#f5f1e8] dark:bg-[#36454F]/10"
                id="services"
              >
                <h2 className="text-center font-serif text-[#36454F] dark:text-[#f5f1e8] text-3xl sm:text-4xl font-bold leading-tight tracking-tight mb-8 sm:mb-12">
                  Our Services
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 max-w-6xl mx-auto">
                  <div className="flex flex-col gap-4 pb-4 bg-[#f6f8f7] dark:bg-[#11211c] rounded-xl shadow-lg overflow-hidden transform hover:-translate-y-2 transition-transform duration-300">
                    <div
                      className="w-full h-40 sm:h-48 bg-center bg-no-repeat bg-cover"
                      style={{
                        backgroundImage:
                          'url("https://lh3.googleusercontent.com/aida-public/AB6AXuD98k2uRgwQZLumR5bw5fXV2-tvtTgZOJze3rguCEO4HlsjByrqIo4E7jYMK_Kz_lZ8BGPSHlm-a91U9ANSXrdfu-G6RIxMzfVVbPlvI-f4vUGsK1dQ0Ql_0hA1h6DE5KWiqVGOCTxtHvOYdyE2nKd-N7heK1uVPA7C4a5-K-VHAUA11Gy635ejGQ0FrqHjB6y2aYh5sJv7QEMT2-uFLJfyU2KblxEf6AV8Ftr9_xBY0jURIKExg2e-Ans82yeyY2sURgGw-DzAvOoH")',
                      }}
                    ></div>
                    <div className="p-4">
                      <p className="text-[#36454F] dark:text-[#f5f1e8] text-lg sm:text-xl font-serif font-bold leading-normal">
                        Swedish Massage
                      </p>
                      <p className="text-[#36454F]/70 dark:text-[#f5f1e8]/70 text-sm font-normal leading-normal mt-2">
                        A gentle massage to relax the entire body, promoting
                        circulation and well-being.
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-col gap-4 pb-4 bg-[#f6f8f7] dark:bg-[#11211c] rounded-xl shadow-lg overflow-hidden transform hover:-translate-y-2 transition-transform duration-300">
                    <div
                      className="w-full h-40 sm:h-48 bg-center bg-no-repeat bg-cover"
                      style={{
                        backgroundImage:
                          'url("https://lh3.googleusercontent.com/aida-public/AB6AXuDYv6gPCM2LIx2AobzFXczrrreAzwLDC_4kH-QuwRx6uj-a93AU1AMEjccmcmRruFLRs3hFMX5WqkeEGF9YfNaiJlSEFyjEjAWMubqoGsnmmh5KJSCT7n-F0dnbxP0HA6K3g5x1ct8rm9_AMqaNTdHZj0lNAzBfz0m9AxQPf9TO5dM0MpobJJSw-Wi0EdDXSyKTh6BENfTXJvAI8MmBzlKAGVbSgDo8KRW0vwwp_aQUGa8kLUMT7Wm77-Osznguq57n768S8Bn55B5L")',
                      }}
                    ></div>
                    <div className="p-4">
                      <p className="text-[#36454F] dark:text-[#f5f1e8] text-lg sm:text-xl font-serif font-bold leading-normal">
                        Deep Tissue Massage
                      </p>
                      <p className="text-[#36454F]/70 dark:text-[#f5f1e8]/70 text-sm font-normal leading-normal mt-2">
                        Targets deeper layers of muscle and connective tissue
                        for chronic aches and pains.
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-col gap-4 pb-4 bg-[#f6f8f7] dark:bg-[#11211c] rounded-xl shadow-lg overflow-hidden transform hover:-translate-y-2 transition-transform duration-300 sm:col-span-2 lg:col-span-1">
                    <div
                      className="w-full h-40 sm:h-48 bg-center bg-no-repeat bg-cover"
                      style={{
                        backgroundImage:
                          'url("https://lh3.googleusercontent.com/aida-public/AB6AXuDn7YD9uSg9yT35u9SLB4txK7lOjmoC2rzgKsuYk0gLHaAB4m8RUIS08XVkyUSANtBrOwKB9YBqSeJXIMJvUKyscBy5OiuxF0SymlDrEXXJ7q2r0mMX7epr6s35LI6x8DyPb-QiYenHGiEU755W6tj8zM9F-mmsocpHWQW8SaAEdJdMo6aWqmARH9AKndEz7d2C0iY46x8ZvMBpVgFwgxZNw_MtFdHxQf0LBcgfQWxiizgKLBzA3XEqDTovBVAdKyIIqmvFWpa9DRse")',
                      }}
                    ></div>
                    <div className="p-4">
                      <p className="text-[#36454F] dark:text-[#f5f1e8] text-lg sm:text-xl font-serif font-bold leading-normal">
                        Full Body Massage
                      </p>
                      <p className="text-[#36454F]/70 dark:text-[#f5f1e8]/70 text-sm font-normal leading-normal mt-2">
                        therapeutic treatment that involves gentle to firm
                        techniques applied to the entire body to relieve
                        tension, ease muscle soreness, and overall physical and
                        mental well-being.
                      </p>
                    </div>
                  </div>
                </div>
              </section>

              {/* Testimonials Section */}
              <section
                className="py-12 sm:py-16 lg:py-20 px-4 sm:px-6 lg:px-10 bg-[#f6f8f7] dark:bg-[#11211c]"
                id="testimonials"
              >
                <div className="max-w-6xl mx-auto">
                  <h2 className="text-center font-serif text-[#36454F] dark:text-[#f5f1e8] text-3xl sm:text-4xl font-bold leading-tight tracking-tight mb-3 sm:mb-4">
                    What Our Clients Say
                  </h2>
                  <p className="text-center text-[#36454F]/70 dark:text-[#f5f1e8]/70 mb-8 sm:mb-12 max-w-2xl mx-auto text-sm sm:text-base px-4">
                    Don't just take our word for it - hear from those who have
                    experienced the Vivify difference
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
                    {/* Testimonial 1 */}
                    <div className="bg-[#f5f1e8] dark:bg-[#36454F]/10 rounded-xl shadow-lg p-6 sm:p-8 transform hover:-translate-y-2 transition-transform duration-300">
                      <div className="flex mb-4">
                        <span className="text-xl sm:text-2xl">⭐⭐⭐⭐⭐</span>
                      </div>
                      <p className="text-[#36454F] dark:text-[#f5f1e8] italic mb-6 leading-relaxed text-sm sm:text-base">
                        "The deep tissue massage was exactly what I needed after
                        months of back pain. The therapist was professional and
                        really knew how to target my problem areas. I left
                        feeling like a new person!"
                      </p>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-[#a3b8a3] flex items-center justify-center text-white font-bold text-base sm:text-lg flex-shrink-0">
                          AO
                        </div>
                        <div>
                          <p className="font-semibold text-[#36454F] dark:text-[#f5f1e8] text-sm sm:text-base">
                            Abimbola Omolola
                          </p>
                          <p className="text-xs sm:text-sm text-[#36454F]/60 dark:text-[#f5f1e8]/60">
                            Regular Client
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Testimonial 2 */}
                    <div className="bg-[#f5f1e8] dark:bg-[#36454F]/10 rounded-xl shadow-lg p-6 sm:p-8 transform hover:-translate-y-2 transition-transform duration-300">
                      <div className="flex mb-4">
                        <span className="text-xl sm:text-2xl">⭐⭐⭐⭐⭐</span>
                      </div>
                      <p className="text-[#36454F] dark:text-[#f5f1e8] italic mb-6 leading-relaxed text-sm sm:text-base">
                        "On holiday in Ilorin. I came across VIVIFY MASSAGE AND
                        SPA online. I booked and had a fantastic massage. The
                        best in a long time. Many thanks to the lady who took
                        care of me. She was really nice and she knows what she
                        was doing. I will surely recommend VIVIFY MASSAGE.
                        Thanks to Timi for the good service provided!"
                      </p>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-[#d8b2a9] flex items-center justify-center text-white font-bold text-base sm:text-lg flex-shrink-0">
                          RB
                        </div>
                        <div>
                          <p className="font-semibold text-[#36454F] dark:text-[#f5f1e8] text-sm sm:text-base">
                            Rahman Babalola
                          </p>
                          <p className="text-xs sm:text-sm text-[#36454F]/60 dark:text-[#f5f1e8]/60">
                            Monthly Member
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Testimonial 3 */}
                    <div className="bg-[#f5f1e8] dark:bg-[#36454F]/10 rounded-xl shadow-lg p-6 sm:p-8 transform hover:-translate-y-2 transition-transform duration-300 md:col-span-2 lg:col-span-1">
                      <div className="flex mb-4">
                        <span className="text-xl sm:text-2xl">⭐⭐⭐⭐⭐</span>
                      </div>
                      <p className="text-[#36454F] dark:text-[#f5f1e8] italic mb-6 leading-relaxed text-sm sm:text-base">
                        "I had a great session. My shoulder and lower back pains
                        were gone by the end of the session. The massage was
                        exactly what I needed, it was both relaxing and
                        effective. The massage therapist was friendly, attentive
                        and skilled in every sense of it. Highly recommend!"
                      </p>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-[#a3b8a3] flex items-center justify-center text-white font-bold text-base sm:text-lg flex-shrink-0">
                          RA
                        </div>
                        <div>
                          <p className="font-semibold text-[#36454F] dark:text-[#f5f1e8] text-sm sm:text-base">
                            Rasheed Akinola
                          </p>
                          <p className="text-xs sm:text-sm text-[#36454F]/60 dark:text-[#f5f1e8]/60">
                            First-Time Visitor
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="text-center mt-8 sm:mt-12">
                    <a
                      className="inline-flex min-w-[140px] sm:min-w-[180px] cursor-pointer items-center justify-center overflow-hidden rounded-xl h-11 sm:h-12 lg:h-14 px-5 sm:px-6 lg:px-8 bg-[#a3b8a3] text-white text-sm sm:text-base lg:text-lg font-bold leading-normal tracking-[0.015em] hover:bg-[#a3b8a3]/90 transition-transform transform hover:scale-105"
                      href="https://vivifymassageandspa.setmore.com"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <span className="truncate">Book Your Experience</span>
                    </a>
                  </div>
                </div>
              </section>

              {/* About Section */}
              <section
                className="py-12 sm:py-16 lg:py-20 px-4 sm:px-6 lg:px-10 bg-[#f5f1e8] dark:bg-[#36454F]/10"
                id="about"
              >
                <h2 className="text-center font-serif text-[#36454F] dark:text-[#f5f1e8] text-3xl sm:text-4xl font-bold leading-tight tracking-tight mb-8 sm:mb-12">
                  About Vivify
                </h2>
                <div className="max-w-4xl mx-auto">
                  <div className="text-[#36454F] dark:text-[#f5f1e8] text-center space-y-6">
                    <p className="font-light leading-relaxed text-base sm:text-lg md:text-xl">
                      Vivify was born from a passion for holistic wellness and
                      the belief that true relaxation is a vital part of a
                      healthy lifestyle. Our philosophy is simple: to provide a
                      serene sanctuary where you can escape the stresses of
                      daily life and reconnect with your mind, body, and spirit.
                    </p>
                    <p className="font-light leading-relaxed text-base sm:text-lg md:text-xl">
                      Our team of expert therapists is dedicated to providing
                      personalized treatments that cater to your unique needs.
                      We use only the finest natural and organic products to
                      ensure a pure and luxurious experience. Step into our
                      tranquil oasis and let us guide you on a journey to
                      rejuvenation and inner peace.
                    </p>
                  </div>
                </div>
              </section>

              {/* Address Section */}
              <section
                className="py-12 sm:py-16 lg:py-20 px-4 sm:px-6 lg:px-10 bg-[#f6f8f7] dark:bg-[#11211c]"
                id="address"
              >
                <h2 className="text-center font-serif text-[#36454F] dark:text-[#f5f1e8] text-3xl sm:text-4xl font-bold leading-tight tracking-tight mb-8 sm:mb-12">
                  Visit Us
                </h2>
                <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-12 items-start">
                  <div className="text-[#36454F] dark:text-[#f5f1e8] order-2 lg:order-1">
                    <h3 className="text-xl sm:text-2xl font-serif font-bold mb-3 sm:mb-4">
                      Vivify Massage & Spa
                    </h3>
                    <p className="mb-2 text-sm sm:text-base">
                      Opeyemi block industry junction, Alao farm, Tanke-Ilorin
                    </p>
                    <p className="mb-4 text-sm sm:text-base break-words">
                      Contact: vivifymassageandspa@gmail.com
                    </p>
                    <p className="mb-4 text-sm sm:text-base break-words">
                      07040723894
                    </p>
                    <h4 className="text-lg sm:text-xl font-serif font-bold mb-2">
                      Operating Hours
                    </h4>
                    <p className="text-sm sm:text-base">
                      Monday - Sunday: 9:00 AM - 6:00 PM
                    </p>
                    <p className="text-sm sm:text-base">
                      Mobile Service 24/7 Everyday
                    </p>
                  </div>
                  <div className="w-full h-64 sm:h-80 lg:h-96 rounded-xl overflow-hidden shadow-lg order-1 lg:order-2">
                    <iframe
                      allowFullScreen
                      height="100%"
                      loading="lazy"
                      referrerPolicy="no-referrer-when-downgrade"
                      src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3956.3087470728426!2d4.5418982!3d8.4799324!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x10364610e3e4f6d9%3A0x67c5b8f8f8b8f8b8!2sIlorin%2C%20Nigeria!5e0!3m2!1sen!2sng!4v1678886450917!5m2!1sen!2sng"
                      style={{ border: 0 }}
                      width="100%"
                    ></iframe>
                  </div>
                </div>
              </section>
            </main>

            {/* Footer */}
            <footer className="bg-[#f5f1e8] dark:bg-[#36454F]/10 py-6 sm:py-8 px-4 sm:px-6 lg:px-10">
              <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center text-center md:text-left gap-4">
                <p className="text-[#36454F]/70 dark:text-[#f5f1e8]/70 text-xs sm:text-sm">
                  © 2025 Vivify Massage and Spa. All rights reserved.
                </p>
                <div className="flex gap-4 sm:gap-6">
                  <a
                    className="text-[#36454F]/70 dark:text-[#f5f1e8]/70 hover:text-[#a3b8a3] dark:hover:text-[#d8b2a9] transition-colors text-xl sm:text-2xl"
                    href="#"
                  >
                    <span>🌿</span>
                  </a>
                  <a
                    className="text-[#36454F]/70 dark:text-[#f5f1e8]/70 hover:text-[#a3b8a3] dark:hover:text-[#d8b2a9] transition-colors text-xl sm:text-2xl"
                    href="#"
                  >
                    <span>💆</span>
                  </a>
                  <a
                    className="text-[#36454F]/70 dark:text-[#f5f1e8]/70 hover:text-[#a3b8a3] dark:hover:text-[#d8b2a9] transition-colors text-xl sm:text-2xl"
                    href="#"
                  >
                    <span>🧘</span>
                  </a>
                </div>
              </div>
            </footer>
          </div>
        </div>
      </div>
    </div>
  );
}
