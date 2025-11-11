'use client'

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/src/components/ui/button";
import { Card, CardContent } from "@/src/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/src/components/ui/tabs";
import { apiFetch, BACKEND_URL } from "@/src/lib/api";

export default function LoginPage() {
  const [selectedOption, setSelectedOption] = useState<'saas' | 'self-hosted'>('saas');
  const router = useRouter();

  // Check if user is already authenticated via cookie
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await apiFetch('/api/v1/login/validate-session');

        if (response.ok) {
          // User is already authenticated, redirect to dashboard
          router.push("/dashboard");
        }
      } catch (error) {
        // User not authenticated, stay on login page
        console.log('Not authenticated, showing login page');
      }
    };

    checkAuth();
  }, [router]);

  const handleGitHubLogin = () => {
    // Redirect to FastAPI backend OAuth endpoint
    window.location.href = `${BACKEND_URL}/api/v1/login/github/authorize`;
  };

  const handleGitLabLogin = () => {
    // Redirect to FastAPI backend OAuth endpoint
    window.location.href = `${BACKEND_URL}/api/v1/login/gitlab/authorize`;
  };



  const getAuthProviders = (option: 'saas' | 'self-hosted') => {
    if (option === 'saas') {
      // Cloud SaaS providers
      return [
        {
          name: "Login with GitHub",
          icon: () => (
            <svg
              stroke="currentColor"
              fill="currentColor"
              strokeWidth="0"
              role="img"
              viewBox="0 0 24 24"
              className="mr-2 shrink-0 transition-transform duration-300"
              height="20"
              width="20"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"></path>
            </svg>
          ),
          onClick: handleGitHubLogin,
          color: "hover:text-[#24292e] hover:bg-[#f6f8fa] hover:border-[#24292e]/20"
        },
        {
          name: "Login with GitLab",
          icon: () => (
            <svg stroke="currentColor"
              fill="currentColor"
              strokeWidth="0"
              role="img"
              viewBox="0 0 24 24"
              className="mr-2 shrink-0 transition-transform duration-300"
              height="20"
              width="20"
              xmlns="http://www.w3.org/2000/svg">
              <path d="m23.6004 9.5927-.0337-.0862L20.3.9814a.851.851 0 0 0-.3362-.405.8748.8748 0 0 0-.9997.0539.8748.8748 0 0 0-.29.4399l-2.2055 6.748H7.5375l-2.2057-6.748a.8573.8573 0 0 0-.29-.4412.8748.8748 0 0 0-.9997-.0537.8585.8585 0 0 0-.3362.4049L.4332 9.5015l-.0325.0862a6.0657 6.0657 0 0 0 2.0119 7.0105l.0113.0087.03.0213 4.976 3.7264 2.462 1.8633 1.4995 1.1321a1.0085 1.0085 0 0 0 1.2197 0l1.4995-1.1321 2.4619-1.8633 5.006-3.7489.0125-.01a6.0682 6.0682 0 0 0 2.0094-7.003z"></path>
            </svg>
          ),
          onClick: handleGitLabLogin,
          color: "hover:text-[#fc6d26] hover:bg-[#fef8f6] hover:border-[#fc6d26]/20"
        },
        {
          name: "Login with Azure DevOps",
          icon: () => (
            <svg stroke="currentColor" 
              fill="currentColor" 
              strokeWidth="0" 
              role="img" 
              viewBox="0 0 16 16" 
              className="mr-2 shrink-0 transition-transform duration-300" 
              height="20" 
              width="20" 
              xmlns="http://www.w3.org/2000/svg">
              <path d="M15 3.62172V12.1336L11.5 15L6.075 13.025V14.9825L3.00375 10.9713L11.955 11.6704V4.00624L15 3.62172ZM12.0163 4.04994L6.99375 1V3.00125L2.3825 4.35581L1 6.12984V10.1586L2.9775 11.0325V5.86767L12.0163 4.04994Z"></path>
            </svg>
          ),
          onClick: () => console.log("Azure DevOps login - Coming soon"),
          color: "hover:text-[#0078d7] hover:bg-[#f0f6fc] hover:border-[#0078d7]/20"
        },
        {
          name: "Login with Bitbucket Cloud",
          icon: () => (
            <svg stroke="currentColor" 
              fill="currentColor" 
              strokeWidth="0" 
              role="img" 
              viewBox="0 0 24 24" 
              className="mr-2 shrink-0 transition-transform duration-300" 
              height="20" 
              width="20" 
              xmlns="http://www.w3.org/2000/svg">
              <path d="M.778 1.213a.768.768 0 00-.768.892l3.263 19.81c.084.5.515.868 1.022.873H19.95a.772.772 0 00.77-.646l3.27-20.03a.768.768 0 00-.768-.891zM14.52 15.53H9.522L8.17 8.466h7.561z"></path>
            </svg>
          ),
          onClick: () => console.log("Bitbucket login - Coming soon"),
          color: "hover:text-[#0052cc] hover:bg-[#f4f8ff] hover:border-[#0052cc]/20"
        }
      ];
    } else {
      // Self-hosted providers
      return [
        {
          name: "GitHub Enterprise Server",
          icon: () => (
            <svg 
              stroke="currentColor" 
              fill="currentColor" 
              strokeWidth="0" 
              role="img" 
              viewBox="0 0 24 24" 
              className="mr-2 shrink-0 transition-transform duration-300" 
              height="20" 
              width="20" 
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"></path>
            </svg>
          ),
          onClick: () => console.log("GitHub Enterprise Server - Coming soon"),
          color: "hover:text-[#24292e] hover:bg-[#f6f8fa] hover:border-[#24292e]/20"
        },
        {
          name: "Self-Hosted GitLab",
          icon: () => (
            <svg stroke="currentColor" 
              fill="currentColor" 
              strokeWidth="0" 
              role="img" 
              viewBox="0 0 24 24" 
              className="mr-2 shrink-0 transition-transform duration-300" 
              height="20" 
              width="20" 
              xmlns="http://www.w3.org/2000/svg">
              <path d="m23.6004 9.5927-.0337-.0862L20.3.9814a.851.851 0 0 0-.3362-.405.8748.8748 0 0 0-.9997.0539.8748.8748 0 0 0-.29.4399l-2.2055 6.748H7.5375l-2.2057-6.748a.8573.8573 0 0 0-.29-.4412.8748.8748 0 0 0-.9997-.0537.8585.8585 0 0 0-.3362.4049L.4332 9.5015l-.0325.0862a6.0657 6.0657 0 0 0 2.0119 7.0105l.0113.0087.03.0213 4.976 3.7264 2.462 1.8633 1.4995 1.1321a1.0085 1.0085 0 0 0 1.2197 0l1.4995-1.1321 2.4619-1.8633 5.006-3.7489.0125-.01a6.0682 6.0682 0 0 0 2.0094-7.003z"></path>
            </svg>
          ),
          onClick: () => console.log("Self-Hosted GitLab - Coming soon"),
          color: "hover:text-[#fc6d26] hover:bg-[#fef8f6] hover:border-[#fc6d26]/20"
        }
      ];
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-200 to-slate-100 relative overflow-hidden">
      {/* Premium background elements */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-secondary/5 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-conic from-primary/5 via-transparent to-secondary/5 rounded-full blur-3xl"></div>
      </div>

      <div className="relative flex items-center justify-center min-h-screen p-4 sm:p-6 lg:p-8">
        <div className="w-full max-w-md mx-auto">
          {/* Logo and Title */}
          <div className="text-center mb-8 sm:mb-12">
            <div className="flex items-center justify-center mb-6 sm:mb-8">
              <svg
                className="w-48 sm:w-60 h-auto"
                viewBox="0 0 140.75185 26.435898"
                version="1.1"
                id="svg5"
                xmlns="http://www.w3.org/2000/svg"
              >
                <g
                  id="layer1"
                  transform="translate(-41.083833,-23.282913)">
                  <g
                    id="g4138"
                    transform="matrix(0.13650447,0,0,0.13650447,41.083832,23.282913)">
                    <g
                      id="layer1-5"
                      style={{ stroke: 'none' }}
                      transform="translate(-16.822974,-12.529328)">
                      <path
                        style={{
                          display: 'inline',
                          fill: '#00617b',
                          fillOpacity: 1,
                          stroke: 'none',
                          strokeWidth: 1.858,
                          strokeDasharray: 'none',
                          strokeOpacity: 1
                        }}
                        id="path603"
                        d="M 194.6193,102.74453 A 88.898163,90.215202 0 0 1 105.92731,192.95949 88.898163,90.215202 0 0 1 16.823931,103.16297 88.898163,90.215202 0 0 1 105.10264,12.531511 88.898163,90.215202 0 0 1 194.61548,101.90765" />
                      <path
                        style={{
                          fill: '#ffffff',
                          fillOpacity: 1,
                          stroke: 'none',
                          strokeWidth: 0.458,
                          strokeDasharray: 'none',
                          strokeOpacity: 1
                        }}
                        d="m 54.897488,118.62163 c 0,0 -3.659831,-43.056851 53.175212,-46.286114 0,0 5.5974,-17.222742 25.61883,-16.576889 20.02144,0.645853 21.959,16.361604 21.959,18.945016 2.40418,4.998788 17.87455,3.696021 22.60485,2.798695 0.66722,-0.135221 2.95415,-0.11132 2.75039,2.586597 -4.87479,15.816936 -23.35383,17.257675 -32.67491,14.205577 0,0 -8.39608,10.548928 -17.65331,18.083878 0,0 -3.22926,10.11836 11.84064,16.57689 0,0 3.21189,1.37329 -0.21529,2.36813 -6.09191,-0.21671 -5.39948,-0.29908 -5.39948,-0.29908 l 3.6992,2.57623 c 0,0 1.156,0.82571 1.45325,1.28811 0.29726,0.4624 0.42937,1.25509 -0.75965,1.35418 -1.18903,0.0991 -2.64229,0.4624 -6.67177,-0.82572 -3.26983,-1.55234 -3.10469,-1.48628 -3.30286,-1.42023 -0.19817,0.0661 -0.33029,0.6936 0.49543,1.3872 0.82571,0.6936 1.81657,1.51932 1.98171,1.8496 0.16514,0.33029 0.99086,0.85874 -0.26423,1.3872 -1.25508,0.52846 -5.58183,-1.32114 -5.58183,-1.32114 0,0 -15.61084,-5.52399 -14.75848,-21.88941 0,0 -0.51141,9.37602 0,10.56933 0.51142,1.19332 -9.88744,7.84177 -19.263465,8.01224 0,0 8.694135,-12.78549 -9.205552,-20.11583 0,0 14.831167,8.18271 4.261829,21.99104 0,0 8.710931,3.71701 9.204355,4.26526 0.493424,0.54825 2.576773,2.30264 -1.864046,2.41229 -4.440815,0.10965 -5.482488,-0.54825 -5.482488,-0.54825 0,0 6.524161,4.44082 5.482488,5.59214 -1.041673,1.15132 -5.592138,-0.0548 -11.513224,-2.68642 0,0 2.412294,2.57677 2.796068,2.8509 0.383775,0.27412 0.877198,2.96054 -5.592137,0.38377 -6.469336,-2.57677 -11.677699,-6.03074 -9.868478,-12.93867 0,0 -7.511009,-3.17984 -9.046105,-4.11187 0,0 -20.723804,12.93868 -26.86419,8.05926 -6.140387,-4.87941 1.535096,-10.52638 3.728091,-11.6777 2.192995,-1.15132 14.838287,-8.15289 14.930152,-8.84621 z"
                        id="path2914" />
                      <path
                        style={{
                          fill: '#00617b',
                          fillOpacity: 1,
                          stroke: 'none',
                          strokeWidth: 0.457999,
                          strokeDasharray: 'none',
                          strokeOpacity: 1
                        }}
                        id="path3022"
                        d="m 145.35648,73.471817 a 4.9267778,4.7614498 0 0 1 -4.91535,4.761437 4.9267778,4.7614498 0 0 1 -4.93815,-4.739352 4.9267778,4.7614498 0 0 1 4.89245,-4.78342 4.9267778,4.7614498 0 0 1 4.96084,4.717166" />
                    </g>
                  </g>
                  <text
                    xmlSpace="preserve"
                    style={{
                      fontStyle: 'normal',
                      fontVariant: 'normal',
                      fontWeight: 'bold',
                      fontStretch: 'normal',
                      fontSize: '24px',
                      fontFamily: "Poppins",
                      fill: '#00617b',
                      fillOpacity: 1,
                      stroke: 'none',
                      strokeWidth: 0.246621
                    }}
                    x="69.007454"
                    y="44.729881"
                    id="text4142">
                    <tspan
                      id="tspan4140"
                      style={{
                        fontStyle: 'normal',
                        fontVariant: 'normal',
                        fontWeight: 'bold',
                        fontStretch: 'normal',
                        fontFamily: "Frutiger",
                        fill: '#00617b',
                        fillOpacity: 1,
                        stroke: 'none',
                        strokeWidth: 0.246621
                      }}
                      x="69.007454"
                      y="44.729881">Falcode</tspan>
                  </text>
                </g>
              </svg>
            </div>

            <div className="space-y-2 mb-8 sm:mb-10">
              <div className="font-500 font-frutiger text-black mb-2 text-lg sm:text-xl lg:text-2xl leading-6 sm:leading-8">
                Welcome to Falcode
              </div>
            </div>

            {/* Enhanced SaaS / Self-Hosted Toggle */}
            <div className="relative bg-white/60 backdrop-blur-sm rounded-2xl p-1.5 mb-6 sm:mb-8 shadow-lg border border-white/20">
              <div className="flex relative">
                <div
                  className={`absolute top-1.5 bottom-1.5 bg-white rounded-xl shadow-md transition-all duration-300 ease-out ${
                    selectedOption === 'saas' ? 'left-1.5 right-1/2 mr-0.5' : 'right-1.5 left-1/2 ml-0.5'
                  }`}
                ></div>
                <button
                  onClick={() => setSelectedOption('saas')}
                  className={`relative flex-1 py-2.5 sm:py-3 px-3 sm:px-4 rounded-xl text-sm font-semibold transition-all duration-300 cursor-pointer ${
                    selectedOption === 'saas'
                      ? 'text-blue-700 z-10'
                      : 'text-slate-600 hover:text-slate-800'
                  }`}
                >
                  <div className="flex items-center justify-center space-x-2">
                    <span className="text-xs sm:text-sm">Cloud SaaS</span>
                  </div>
                </button>
                <button
                  onClick={() => setSelectedOption('self-hosted')}
                  className={`relative flex-1 py-2.5 sm:py-3 px-3 sm:px-4 rounded-xl text-sm font-semibold transition-all duration-300 cursor-pointer ${
                    selectedOption === 'self-hosted'
                      ? 'text-blue-700 z-10'
                      : 'text-slate-600 hover:text-slate-800'
                  }`}
                >
                  <div className="flex items-center justify-center space-x-2">
                    <span className="text-xs sm:text-sm">Self-Hosted</span>
                  </div>
                </button>
              </div>

              {/* Tab descriptions */}
              <div className="mt-3 text-xs text-slate-500 font-medium">
                {selectedOption === 'saas'
                  ? 'Managed cloud platform with enterprise security'
                  : 'Deploy on your infrastructure with full control'
                }
              </div>
            </div>
          </div>

          {/* Enhanced Authentication Card */}
          <Card className="border-0 shadow-2xl shadow-slate-900/5 bg-white/70 backdrop-blur-md rounded-3xl overflow-hidden">
            <CardContent className="p-6 sm:p-8">
              <Tabs defaultValue={selectedOption} value={selectedOption} onValueChange={(value) => setSelectedOption(value as 'saas' | 'self-hosted')} className="w-full">
                <TabsList className="hidden">
                  <TabsTrigger value="saas">Cloud SaaS</TabsTrigger>
                  <TabsTrigger value="self-hosted">Self-Hosted</TabsTrigger>
                </TabsList>
                <TabsContent
                  value="saas"
                  className="ring-offset-background focus-visible:ring-ring mt-2 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-hidden min-h-[12rem] sm:h-[15rem]"
                >
                  {getAuthProviders('saas').map((provider, index) => (
                    <Button
                      key={provider.name}
                      onClick={provider.onClick}
                      variant="outline"
                      className={`
                        inline-flex items-center justify-center whitespace-nowrap text-sm sm:text-base
                        ring-offset-background transition-all duration-300 ease-in-out
                        focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2
                        disabled:pointer-events-none disabled:opacity-50
                        w-full bg-white border-none rounded-4xl h-12 sm:h-13 max-w-96 mx-auto hover:bg-white ${index > 0 ? 'mt-3 sm:mt-4' : ''} px-3 sm:px-4 py-2
                        text-slate-800 shadow-sm
                        hover:bg-white hover:cursor-pointer hover:shadow-md
                        hover:translate-y-[-2px] hover:border-blue-300
                        active:translate-y-[0px] active:shadow-sm
                        ${provider.color}
                      `}
                    >
                      <span className="inline-flex items-center w-[240px] sm:w-[280px] pl-12">
                        <provider.icon/>
                        {provider.name}
                      </span>
                    </Button>
                  ))}
                </TabsContent>
                <TabsContent
                  value="self-hosted"
                  className="ring-offset-background focus-visible:ring-ring mt-2 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-hidden min-h-[12rem] sm:h-[15rem]"
                >
                  {getAuthProviders('self-hosted').map((provider, index) => (
                    <Button
                      key={provider.name}
                      onClick={provider.onClick}
                      variant="outline"
                      className={`
                        inline-flex items-center justify-center whitespace-nowrap text-sm sm:text-base
                        ring-offset-background transition-all duration-300 ease-in-out
                        focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2
                        disabled:pointer-events-none disabled:opacity-50
                        w-full bg-white border-none rounded-4xl h-12 sm:h-13 max-w-96 mx-auto hover:bg-white ${index > 0 ? 'mt-3 sm:mt-4' : ''} px-3 sm:px-4 py-2
                        text-slate-800 shadow-sm
                        hover:bg-white hover:cursor-pointer hover:shadow-md
                        hover:translate-y-[-2px] hover:border-blue-300
                        active:translate-y-[0px] active:shadow-sm
                        ${provider.color}
                      `}
                    >
                       <span className="inline-flex items-center w-[240px] sm:w-[280px] pl-12">
                        <provider.icon/>
                        {provider.name}
                      </span>
                    </Button>
                  ))}
                </TabsContent>
              </Tabs>
              {/* Enhanced Sign Up Section */}
              <div className="mt-6 sm:mt-8 pt-6 sm:pt-8 text-center">
                <p className="text-sm text-slate-600">
                  Don't have an account?{" "}
                  <button
                    onClick={() => console.log("Sign up clicked")}
                    className="text-blue-600 hover:text-blue-700 hover:underline transition-colors underline-offset-2 font-semibold cursor-pointer"
                  >
                    Sign up here
                  </button>
                </p>
              </div>

              {/* Enhanced Legal Text */}
              <div className="text-center mt-6 sm:mt-8 pt-4 sm:pt-6 border-t border-slate-200/30">
                <p className="text-xs text-slate-500 leading-relaxed font-medium px-2">
                  By continuing, you agree to our{" "}
                  <button
                    onClick={() => console.log("Terms clicked")}
                    className="text-blue-600 hover:text-blue-700 hover:underline transition-colors underline-offset-2 font-semibold cursor-pointer"
                  >
                    Terms of Service
                  </button>{" "}
                  and{" "}
                  <button
                    onClick={() => console.log("Privacy clicked")}
                    className="text-blue-600 hover:text-blue-700 hover:underline transition-colors underline-offset-2 font-semibold cursor-pointer"
                  >
                    Privacy Policy
                  </button>
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}