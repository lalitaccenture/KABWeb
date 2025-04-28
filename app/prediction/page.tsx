'use client';

import dynamic from "next/dynamic";
import Image from "next/image";
import { MdLogout } from "react-icons/md";
import { useEffect, useState } from "react";
import {
  Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale,
  LinearScale,
  BarElement,
  Title,
  ChartOptions
} from 'chart.js';
import { Doughnut, Bar } from 'react-chartjs-2';
import { Button } from "@/components/ui/button";
import { analysisNewDropdown, applyFilter, getAmenities, getAmenitiesPrediction, getAnalysisExternalData, getBinPrediction, getDashboardPrediction, getDashboardPredictionNew, getEventPrediction, getPredictionDashboard, getPredictionDashboardMap, getPredictionMap, getPredictionMapNew, predictionNewDropdown } from "../utils/api";
import Switch from "react-switch";
import WeekSelector from "@/src/components/WeekSelector";
import { signOut, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { formatNumberMillion } from "@/utils/common";
import { FaInfoCircle } from "react-icons/fa";
import { useProfileStore } from "@/stores/profileStore";
import { toast } from "react-toastify";
const MapPrediction = dynamic(() => import("../../src/components/PredictionMap"), { ssr: false });
const Select = dynamic(() => import('react-select'), { ssr: false });

interface FilterOption {
  value: string | null;
  label: string;
}

interface Filters {
  state: FilterOption | null;
  county: FilterOption | null;
  tract: FilterOption | null;
  week_id: number | null;
  colorType?: string | null;
}

interface MarkerData {
  latitude: number;
  longitude: number;
  Litter_density: number;
  GEOID: string;
  Predicted_Qty: number;
  colorType: string;
  pie_chart: object
}

interface SwitchState {
  bins: boolean;
  events: boolean;
  amenities: boolean
  transit: boolean,
  entertainment: boolean,
  education: boolean,
  retail: boolean
}

// Define the props for the SwitchItem component
interface SwitchItemProps {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  onColor?: string
}


ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale,
  LinearScale,
  BarElement,
  Title);

interface EventData {
  Impact: string;
  "Event count": number;
  latitude: number;
  longitude: number;
  GEOID: string;
  pie_chart: object
}

interface BinData {
  latitude: number;
  longitude: number;
}

interface AmenitiesData extends BinData {
  type: string;
}

type Week = {
  week_id: number;
  week: string;
  status: string
};

const Prediction = () => {

  const [filters, setFilters] = useState<Filters>({
    state: null,
    county: null,
    tract: null,
    week_id: null,
    colorType: null
  });
  const [markers, setMarkers] = useState<MarkerData[]>([]);
  const [zoom, setZoom] = useState<number>(10);
  const [center, setCenter] = useState<[number, number]>([37.0902, -95.7129]);

  const [statesData, setStatesData] = useState<any[]>([]);
  const [countiesData, setCountiesData] = useState<any[]>([]);
  const [tractsData, setTractsData] = useState<any[]>([]);
  const [predictionData, setPredictionData] = useState<any>({});
  const [loadingAnalysisData, setLoadingAnalysisData] = useState<boolean>(false);
  const [loadingExternalData, setLoadingExternalData] = useState<boolean>(false);
  const [loadingMapData, setLoadingMapData] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null);
  const [switches, setSwitches] = useState<SwitchState>({
    bins: false,
    events: false,
    amenities: false,
    transit: false,
    entertainment: false,
    education: false,
    retail: false
  });
  const [loadingAnalysisNewData, setLoadingAnalysisNewData] = useState<boolean>(false);
  const [weeks, setWeeks] = useState<Week[]>([])
  const [eventData, setEventData] = useState<EventData[]>([]);
  const [selectedWeekId, setSelectedWeekId] = useState<any>();
  const [loadingEventData, setLoadingEventData] = useState<boolean>(false);
  const [loadingBinData, setLoadingBinData] = useState<boolean>(false);
  const [loadingAmenitiesData, setLoadingAmenitiesData] = useState<boolean>(false);
  const [binData, setBinData] = useState<BinData>();
  const [amenitiesData, setAmenitiesData] = useState<AmenitiesData>();
  const [activeButton, setActiveButton] = useState('prediction')
  const { data: session, status } = useSession();
  const [amenitiesRetail, setAmenitiesRetail] = useState();
  const [amenitiesEntertainment, setAmenitiesEntertainment] = useState();
  const [amenitiesTransit, setAmenitiesTransit] = useState();
  const [amenitiesEducation, setAmenitiesEducation] = useState();
  const stateFromStore = useProfileStore((s) => s.state);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);

  const router = useRouter();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/"); // Redirect to login page
    }
  }, [status, router]);




  const handleChange = (switchName: keyof SwitchState) =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const { checked } = e.target;
      setSwitches((prevState) => ({
        ...prevState,
        [switchName]: checked,
      }));
    };

  const fetchData = async () => {
    setLoadingExternalData(true);
    setLoadingAnalysisData(true);
    setLoadingAnalysisNewData(true);
    setLoadingMapData(true);
    setLoadingEventData(true);
    setLoadingAmenitiesData(true);
    setLoadingBinData(true);
    setError(null);

    try {

      const dropD = await predictionNewDropdown();
      if (!dropD) throw new Error("Failed to fetch dropdown data");

      setStatesData(dropD?.Dropdown);
      setWeeks(dropD?.Weeks);

      const defaultState = dropD?.Dropdown.find((state: { value: string }) => state.value === "California");
      if (defaultState) {
        setFilters((prev) => ({ ...prev, state: defaultState }));
      }
      const queryParamsForCounty = {
        state: 'California',
      };
      const forCountyPopulate = await predictionNewDropdown(queryParamsForCounty)
      setCountiesData(forCountyPopulate?.Dropdown)


      const weekId = dropD?.Weeks[0]?.week_id;
      setSelectedWeekId(weekId);



      const [
        dashboardRes,
        mapRes,
        eventRes,
        binRes,
        // amenitiesRes,
        amenitiesRetail,
        amenitiesEntertainment,
        amenitiesTransit,
        amenitiesEducation
      ] = await Promise.allSettled([
        getDashboardPredictionNew({ State: "California", week_id: weekId }),
        getPredictionMapNew({ State: "California", week_id: weekId }),
        getEventPrediction({ State: "California", week_id: weekId }),
        getBinPrediction({ State: "California" }),
        // getAmenitiesPrediction({ State: "California" }),
        getAmenities({ State: "California", Category: "Retail" }),
        getAmenities({ State: "California", Category: "Entertainment" }),
        getAmenities({ State: "California", Category: "Transit" }),
        getAmenities({ State: "California", Category: "Education" })
      ]);

      if (dashboardRes.status === "fulfilled") {
        setPredictionData(dashboardRes.value);
      }

      if (mapRes.status === "fulfilled") {
        setMarkers(mapRes.value?.data);
        setZoom(10);
        if (mapRes.value?.centroid !== "No location found") {
          setCenter(mapRes.value?.centroid);
        }
      }

      if (eventRes.status === "fulfilled") {
        setEventData(eventRes.value?.data);
      }

      if (binRes.status === "fulfilled") {
        setBinData(binRes.value);
      }

      // if (amenitiesRes.status === "fulfilled") {
      //   setAmenitiesData(amenitiesRes.value);
      // }
      if (amenitiesRetail.status === "fulfilled") {
        setAmenitiesRetail(amenitiesRetail.value);
      }
      if (amenitiesEntertainment.status === "fulfilled") {
        setAmenitiesEntertainment(amenitiesEntertainment.value);
      }
      if (amenitiesTransit.status === "fulfilled") {
        setAmenitiesTransit(amenitiesTransit.value);
      }
      if (amenitiesEducation.status === "fulfilled") {
        setAmenitiesEducation(amenitiesEducation.value);
      }

      if ([dashboardRes, mapRes, eventRes, binRes].some(r => r.status === "rejected")) {
        setError("Some data failed to load. Please try again later.");
      }
    } catch (error) {
      console.error("Dropdown API failed:", error);
      setError("Failed to fetch dropdown data.");
    }


    setLoadingExternalData(false);
    setLoadingAnalysisData(false);
    setLoadingAnalysisNewData(false);
    setLoadingMapData(false);
    setLoadingEventData(false);
    setLoadingAmenitiesData(false);
    setLoadingBinData(false);
  };

  useEffect(() => {
    // const fetchData = async () => {
    //   setLoadingExternalData(true);
    //   setLoadingAnalysisData(true);
    //   setLoadingAnalysisNewData(true);
    //   setLoadingMapData(true);
    //   setLoadingEventData(true);
    //   setLoadingAmenitiesData(true)
    //   setLoadingBinData(true)
    //   setError(null);

    //   try {

    //     const dropD = await predictionNewDropdown();
    //     setStatesData(dropD?.Dropdown)
    //     setWeeks(dropD?.Weeks)
    //     const defaultState = dropD?.Dropdown.find((state: { value: string; }) => state.value === "California");
    //   if (defaultState) {
    //     setFilters(prevFilters => ({ ...prevFilters, state: defaultState }));
    //   }
    //     setSelectedWeekId(dropD?.Weeks[0]?.week_id)
    //     setLoadingAnalysisNewData(false)
    //     setLoadingExternalData(false);
    //     setLoadingAnalysisData(false);
    //     const dataDashboard = await getDashboardPrediction();
    //     setPredictionData(dataDashboard);
    //     // if (dataDashboard?.centroid === "No location found") {

    //     // }
    //     // else {
    //     //   setCenter(dataDashboard?.centroid)
    //     // }
    //       const resp = await getPredictionMap({"State":"California"});
    //       console.log("Raw response:map", resp, typeof resp);
    //       const respm = await getEventPrediction();
    //       console.log("Raw response:eventData", respm, typeof respm);
    //       const binData = await getBinPrediction();
    //       console.log("Raw response:binData", binData, typeof binData);
    //       const amenitiesData = await getAmenitiesPrediction();
    //       console.log("Raw response:amenitiesData", amenitiesData, typeof amenitiesData);


    //   setMarkers(resp?.data)
    //   setEventData(respm?.data)
    //   setBinData(binData)
    //   setAmenitiesData(amenitiesData)
    //     setLoadingMapData(false);
    //     setLoadingEventData(false)
    //     setLoadingAmenitiesData(false)
    //     setLoadingBinData(false)
    //     // const value = await applyFilter();
    //     // setAnalysisData(value);

    //     // setLoadingAnalysisData(false);
    //   } catch (error) {
    //     setError("Failed to fetch data, please try again later.");

    //     setLoadingAnalysisData(false);
    //     setLoadingExternalData(false);
    //     setLoadingAnalysisNewData(false)
    //     setLoadingMapData(false);
    //     setLoadingEventData(false)
    //     setLoadingAmenitiesData(false)
    //     setLoadingBinData(false)
    //   } finally {

    //   }
    // };




    fetchData();
  }, []);



  const handleFilterChange = (filter: string, selectedOption: any) => {
    if (filter == 'state') {
      setFilters(prevFilters => ({
        ...prevFilters,
        [filter]: selectedOption,
        county: null,
        tract: null
      }));
    }
    else if (filter == 'county') {
      setFilters(prevFilters => ({
        ...prevFilters,
        [filter]: selectedOption,
        tract: null
      }));
    }

    else
      setFilters(prevFilters => ({
        ...prevFilters,
        [filter]: selectedOption,
      }));
  };

  const handleDropdownFurther = async (val: string, selectedOption: any) => {
    try {
      setLoadingAnalysisNewData(true)
      console.log("selectedOption", selectedOption)
      let queryParams;
      if ((val == "state")) {
        queryParams = {
          state: selectedOption?.value || null,
        };
      }
      else if (val == "county") {
        //setFilters({...filters,tract:null})
        queryParams = {
          state: filters?.state?.value || null,
          county: selectedOption?.value || null,
        };
      }

      const dropD = await predictionNewDropdown(queryParams);
      if (val == "state") {

        setCountiesData(dropD?.Dropdown)
        setLoadingAnalysisNewData(false)
      }
      else if (val == "county") {
        setTractsData(dropD?.Dropdown)
        setLoadingAnalysisNewData(false)
      }
    }
    catch (error) {
      alert("error")
      setLoadingAnalysisNewData(false)
    }
  }

  const handleApply = async () => {

    const queryParams = {
      State: filters.state?.value || null,
      County: filters.county?.value || null,
      TRACTID: filters.tract?.value || null,
      //week_id: selectedWeekId || null
    };


    // Filter out undefined values
    const cleanedQueryParams = Object.fromEntries(
      Object.entries(queryParams).filter(([_, v]) => v !== undefined)
    );

    setLoadingAnalysisData(true);
    setLoadingMapData(true);
    setLoadingEventData(true)
    setLoadingAmenitiesData(true)
    setLoadingBinData(true)
    try {
      const results = await Promise.allSettled([
        getDashboardPredictionNew({ ...queryParams, week_id: selectedWeekId || null }),
        getPredictionMapNew({ ...queryParams, week_id: selectedWeekId || null }),
        getEventPrediction({ ...queryParams, week_id: selectedWeekId || null }),
        getBinPrediction(queryParams),
        //getAmenitiesPrediction(queryParams),
        getAmenities({ ...queryParams, Category: "Retail" }),
        getAmenities({ ...queryParams, Category: "Entertainment" }),
        getAmenities({ ...queryParams, Category: "Transit" }),
        getAmenities({ ...queryParams, Category: "Education" })
      ]);

      const [dashboardRes, mapRes, eventRes, binRes,
        //amenitiesRes,
        amenitiesRetail,
        amenitiesEntertainment,
        amenitiesTransit,
        amenitiesEducation
      ] = results;

      if (dashboardRes.status === "fulfilled") {
        setPredictionData(dashboardRes.value);
      }

      if (mapRes.status === "fulfilled") {
        setMarkers(mapRes.value?.data);
        setZoom(10);
        if (mapRes.value?.centroid !== "No location found") {
          setCenter(mapRes.value?.centroid);
        }
        if (queryParams?.State && !queryParams?.County && !queryParams?.TRACTID) {
          // If state is present and county and tract are null
          setZoom(11);
        } else if (queryParams?.State && queryParams?.County && !queryParams?.TRACTID) {
          // If state and county are present and tract is null
          setZoom(12);
        } else if (queryParams?.State && queryParams?.County && queryParams?.TRACTID) {
          // If state, county, and tract are all present
          setZoom(13);
        }
      }

      if (eventRes.status === "fulfilled") {
        setEventData(eventRes.value?.data);
      }

      if (binRes.status === "fulfilled") {
        setBinData(binRes.value);
      }

      // if (amenitiesRes.status === "fulfilled") {
      //   setAmenitiesData(amenitiesRes.value);
      // }

      if (amenitiesRetail.status === "fulfilled") {
        setAmenitiesRetail(amenitiesRetail.value);
      }
      if (amenitiesEntertainment.status === "fulfilled") {
        setAmenitiesEntertainment(amenitiesEntertainment.value);
      }
      if (amenitiesTransit.status === "fulfilled") {
        setAmenitiesTransit(amenitiesTransit.value);
      }
      if (amenitiesEducation.status === "fulfilled") {
        setAmenitiesEducation(amenitiesEducation.value);
      }

    } catch (error) {
      console.error("Unexpected error:", error);
      setError("Something went wrong while fetching data.");
    }

    // Turn off all loaders
    setLoadingAnalysisData(false);
    setLoadingMapData(false);
    setLoadingEventData(false);
    setLoadingAmenitiesData(false);
    setLoadingBinData(false);
  };

  const handleClear = () => {
    setFilters({
      state: null,
      county: null,
      tract: null,
      week_id: null,
      colorType: null
    });
    fetchData();
  };

  const options = {
    plugins: {
      title: {
        display: true,
        text: 'Chart.js Bar Chart - Stacked',
      },
    },
    responsive: true,
    scales: {
      x: {
        stacked: true,
      },
      y: {
        stacked: true,
      },
    },
  };

  const labels = ['January'];

  const data = {
    labels,
    datasets: [
      {
        label: 'Dataset 1',
        data: [60],
        backgroundColor: 'rgb(255, 99, 132)',
      },
      {
        label: 'Dataset 2',
        data: [49],
        backgroundColor: 'rgb(75, 192, 192)',
      },
      {
        label: 'Dataset 3',
        data: [87],
        backgroundColor: 'rgb(53, 162, 235)',
      },
    ],
  };

  const dataDoughnut = {
    labels: Object.keys(predictionData?.total?.pie_chart || {}),
    datasets: [
      {
        label: '# of Litter',
        data: Object.values(predictionData?.total?.pie_chart || {}),
        backgroundColor: [
          '#E97132',  // Cigarette (Orange)
          '#196B24',  // Glass (Green)
          '#0F9ED5',  // Plastic (Light Blue)
          '#974F91',  // Rubber (Purple)
          '#DE9ED8',  // Organic (Pink)
          '#AAB4B8',  // Metal (Gray)
          '#E6E6E6',  // Paper (Light Gray)
          '#156082',
        ],
        borderColor: [
          '#E97132',  // Cigarette (Orange)
          '#196B24',  // Glass (Green)
          '#0F9ED5',  // Plastic (Light Blue)
          '#974F91',  // Rubber (Purple)
          '#DE9ED8',  // Organic (Pink)
          '#AAB4B8',  // Metal (Gray)
          '#E6E6E6',  // Paper (Light Gray)
          '#156082',
        ],
        borderWidth: 1,
      },
    ],
  };

  const optionsDoughnut: ChartOptions<'doughnut'> = {
    maintainAspectRatio: false,
    responsive: true,
    cutout: '40%', // Keeps a thinner doughnut
    layout: {
      padding: 15, // Adds some spacing around
    },
    plugins: {
      legend: {
        position: 'bottom',
        align: 'center',
        labels: {
          boxWidth: 14,
          padding: 12,
        },
      },
      datalabels: {
        display: false
      },
      tooltip: {
        callbacks: {
          label: (tooltipItem) => {
            const dataset = tooltipItem.dataset.data as number[];
            const total = dataset.reduce((acc, val) => acc + val, 0);
            const value = tooltipItem.raw as number;
            const percentage = ((value / total) * 100).toFixed(1);

            return [`# of Litter: ${formatNumberMillion(value)}`, `(${percentage}%)`];
          },
        },
      },
    },
  };

  const isClearButtonEnabled = Object.values(filters).some((value) => value !== null);

  const SwitchItem: React.FC<SwitchItemProps> = ({ label, checked, onChange, onColor = "#5BAA76" }) => (
    <div className="flex items-center space-x-2">
      <Switch
        onChange={onChange}
        checked={checked}
        uncheckedIcon={false}
        checkedIcon={false}
        onColor={onColor}
        height={15}
        width={30}
        handleDiameter={14}
        activeBoxShadow={`0 0 5px 2px ${onColor}`}
      />
      <span>{label}</span>
    </div>
  );


  console.log("selectedWeekId", selectedWeekId)

  const handleApplySelectedWeek = async (weekID: any) => {
    const queryParams = {
      State: filters.state?.value || null,
      County: filters.county?.value || null,
      TRACTID: filters.tract?.value || null,
      //week_id: weekID || null,
    };
    setLoadingAnalysisData(true);
    setLoadingMapData(true);
    setLoadingEventData(true)
    setLoadingAmenitiesData(true)
    setLoadingBinData(true)
    try {
      const results = await Promise.allSettled([
        getDashboardPredictionNew({ ...queryParams, week_id: weekID || null, }),
        getPredictionMapNew({ ...queryParams, week_id: weekID || null, }),
        getEventPrediction({ ...queryParams, week_id: weekID || null, }),
        getBinPrediction(queryParams),
        //getAmenitiesPrediction(queryParams),
        getAmenities({ ...queryParams, Category: "Retail" }),
        getAmenities({ ...queryParams, Category: "Entertainment" }),
        getAmenities({ ...queryParams, Category: "Transit" }),
        getAmenities({ ...queryParams, Category: "Education" })
      ]);

      const [dashboardRes, mapRes, eventRes, binRes,
        //amenitiesRes,
        amenitiesRetail,
        amenitiesEntertainment,
        amenitiesTransit,
        amenitiesEducation
      ] = results;

      if (dashboardRes.status === "fulfilled") {
        setPredictionData(dashboardRes.value);
      }

      if (mapRes.status === "fulfilled") {
        setMarkers(mapRes.value?.data);
        setZoom(10);
        if (mapRes.value?.centroid !== "No location found") {
          setCenter(mapRes.value?.centroid);
        }
        if (queryParams?.State && !queryParams?.County && !queryParams?.TRACTID) {
          // If state is present and county and tract are null
          setZoom(11);
        } else if (queryParams?.State && queryParams?.County && !queryParams?.TRACTID) {
          // If state and county are present and tract is null
          setZoom(12);
        } else if (queryParams?.State && queryParams?.County && queryParams?.TRACTID) {
          // If state, county, and tract are all present
          setZoom(13);
        }
      }

      if (eventRes.status === "fulfilled") {
        setEventData(eventRes.value?.data);
      }

      if (binRes.status === "fulfilled") {
        setBinData(binRes.value);
      }

      // if (amenitiesRes.status === "fulfilled") {
      //   setAmenitiesData(amenitiesRes.value);
      // }

      if (amenitiesRetail.status === "fulfilled") {
        setAmenitiesRetail(amenitiesRetail.value);
      }
      if (amenitiesEntertainment.status === "fulfilled") {
        setAmenitiesEntertainment(amenitiesEntertainment.value);
      }
      if (amenitiesTransit.status === "fulfilled") {
        setAmenitiesTransit(amenitiesTransit.value);
      }
      if (amenitiesEducation.status === "fulfilled") {
        setAmenitiesEducation(amenitiesEducation.value);
      }

    } catch (error) {
      console.error("Unexpected error:", error);
      setError("Something went wrong while fetching data.");
    }

    // Turn off all loaders
    setLoadingAnalysisData(false);
    setLoadingMapData(false);
    setLoadingEventData(false);
    setLoadingAmenitiesData(false);
    setLoadingBinData(false);
  }


  if (status === "loading") {
    return <p>Loading...</p>; // Prevents UI flickering
  }

  const handleLogoClick = () => {
    if (status === "authenticated") {
      router.push("/analysis-external");
    } else {
      router.push("/");
    }
  };
  const handleLogout = async () => {
    const confirmLogout = window.confirm("Are you sure you want to log out?");
    if (confirmLogout) {
      await signOut({ redirect: false }); // Prevents full page reload
      router.push("/");
      console.log("Logged out");
    }
    else {
      console.log("Logout canceled");
    }
  };

  const handleFilterColor = async (color: string) => {
    setLoadingMapData(true)
    try {
      setFilters((prev) => ({
        ...prev,
        colorType: color === '#800080' ? undefined : color
      }));
      const queryParams = {
        State: filters.state?.value || null,
        County: filters.county?.value || null,
        TRACTID: filters.tract?.value || null,
        week_id: selectedWeekId || null,

      };
      if (color !== '#800080') {
        // @ts-ignore: Ignore TypeScript error
        queryParams.colorType = color;
      }

      const data = await getPredictionMapNew(queryParams)
      if (data) {
        setMarkers(data?.data);
        setZoom(10);
        if (data?.centroid !== "No location found") {
          setCenter(data?.centroid);
        }
      }
    }
    catch (error) {
      toast.error("Some issue while filtering")
    }
    finally {
      setLoadingMapData(false)
    }

  }


  return (

    <div className="min-h-screen w-full flex p-4" style={{ backgroundColor: "rgba(91, 170, 118, 0.1)" }}>

      <div className="w-1/5 p-4 bg-white shadow-2xl rounded-lg flex flex-col" style={{ marginTop: '-7%', marginLeft: '-2%' }}>
        {/* Top section (Logo + Menu) */}
        <div className="flex flex-col items-center" style={{ marginTop: '-7%' }}>
          <p className="text-[#5BAA76] text-xl font-bold cursor-pointer font-neris" onClick={handleLogoClick}>
            LitterSense
          </p>
          <Image src="/powered.png" alt="Accenture" width={100} height={14} className="object-contain mt-[-4px]" />
        </div>

        <div className="mt-6">
          <p className="text-gray-400 text-sm font-semibold mb-2">Menu</p>
          <div className="flex flex-col gap-2">
            <button
              className={`flex items-center gap-2 p-2 rounded-lg w-full font-neris text-sm ${activeButton === 'analysis' ? 'bg-[#DCFCE7] text-green-700' : 'bg-gray-100 text-gray-700'
                }`}
              onClick={() => {
                setActiveButton('analysis');
                router.push('/analysis-external');
              }}
            >
              <span>Analysis</span>
            </button>

            <button
              className={`flex items-center gap-2 p-2 rounded-lg w-full font-neris text-sm ${activeButton === 'prediction' ? 'bg-[#DCFCE7] text-green-700' : 'bg-gray-100 text-gray-700'
                }`}
              onClick={() => {
                setActiveButton('prediction');
                router.push('/prediction');
              }}
            >
              <span>Prediction</span>
            </button>


          </div>
        </div>

        {/* Spacer */}
        <div className="flex-grow"></div>

        {/* Footer */}
        <div className="mt-auto">
          <div className="flex justify-center mb-2">
            <button
              onClick={handleLogout}
              className="flex items-center justify-center gap-2 px-4 py-2 bg-[#5BAA76] text-white rounded-lg transition-all hover:bg-[#4A9463]"
              title="Logout"
            >
              <MdLogout size={20} />
              <span>Logout</span>
            </button>
          </div>

          <div className="flex justify-center">
            <p className="text-xs text-gray-600 whitespace-nowrap">
              Keep America Beautiful © Copyright 2025
            </p>
          </div>

          <div className="flex justify-center mt-2">
            <Image src="/kab.png" alt="Logo KAB" width={178} height={28} className="object-contain" />
          </div>
        </div>
      </div>


      <div className="w-3/5 p-4 flex flex-col justify-start items-center gap-4 mt-[-1.5%]" style={{ marginLeft: '2%' }}>
        <div
          className="p-4 rounded-md shadow-md"
          style={{
            background: "white",
            position: "absolute",
            width: '55.2%',
            zIndex: 1000,
            display: "flex",
            flexDirection: "column",
            maxWidth: "100%",

          }}
        >
          <p className="font-semibold text-base mb-2">Filter Prediction Sites</p>
          <div className="flex flex-row gap-4  ">


            <div style={{
              width: "max-content",
              maxWidth: "21%",
              minWidth: "21%",
              flex: "0.2",

              position: 'relative',
              zIndex: 1000
            }}>
              <label htmlFor="state" className="block text-sm font-medium text-gray-700">State</label>
              {loadingAnalysisNewData ? (
                <div>Loading states...</div>
              ) : (
                <Select
                  id="state"
                  value={filters.state}
                  onChange={(selectedOption) => {
                    handleFilterChange('state', selectedOption)
                    handleDropdownFurther('state', selectedOption)
                  }}
                  options={statesData}
                  placeholder="Select a State"
                  styles={{
                    control: (base, state) => ({
                      ...base,
                      borderColor: state.isFocused || state.hasValue ? "#5BAA76" : base.borderColor,
                      boxShadow:
                        state.isFocused || state.hasValue
                          ? "0px 2px 4px rgba(91, 170, 118, 0.3)" // Always show shadow if selected
                          : "none",
                      transition: "all 0.2s ease-in-out",
                      "&:hover": {
                        borderColor: "#5BAA76",
                      },
                    }),
                    placeholder: (base) => ({
                      ...base,
                      color: "#C5C5C5",
                      fontSize: "12px",
                    }),
                    option: (base, { isSelected, isFocused }) => ({
                      ...base,
                      backgroundColor: isSelected
                        ? "#5BAA76" // ✅ Selected stays green
                        : isFocused
                          ? "#A5D6A7" // ✅ Light green on hover
                          : "white",
                      color: isSelected ? "white" : "black",
                      fontWeight: isSelected ? "600" : "normal", // ✅ Semi-bold when selected
                      "&:hover": {
                        backgroundColor: "#5BAA76",
                        color: "white",
                      },
                      "&:active": {
                        backgroundColor: "#5BAA76",
                      },
                    }),
                    singleValue: (base) => ({
                      ...base,
                      color: "black", // ✅ Selected value should be black
                      fontWeight: "semibold", // ✅ Selected value should be semi-bold
                    }),
                  }}
                />
              )}
            </div>


            <div style={{
              width: "100%",          // or "40%", or "300px"
              maxWidth: "35%",
              minWidth: "35%",
              flex: "0.2",             // optional — you can remove or adjust based on layout
              whiteSpace: 'nowrap',
              position: 'relative',
              zIndex: 1000
            }}>

              <label htmlFor="county" className="block text-sm font-medium text-gray-700">City, County</label>
              {loadingAnalysisNewData ? (
                <div>Loading counties...</div>
              ) : (
                <Select
                  id="county"
                  value={filters.county}
                  onChange={(selectedOption) => {
                    handleFilterChange('county', selectedOption)
                    handleDropdownFurther('county', selectedOption)
                  }}
                  options={countiesData}
                  isDisabled={!filters?.state?.value}
                  placeholder="Select a County"
                  styles={{
                    control: (base, state) => ({
                      ...base,
                      borderColor: state.isFocused || state.hasValue ? "#5BAA76" : base.borderColor,
                      boxShadow:
                        state.isFocused || state.hasValue
                          ? "0px 2px 4px rgba(91, 170, 118, 0.3)" // Always show shadow if selected
                          : "none",
                      transition: "all 0.2s ease-in-out",
                      "&:hover": {
                        borderColor: "#5BAA76",
                      },
                    }),
                    placeholder: (base) => ({
                      ...base,
                      color: "#C5C5C5",
                      fontSize: "12px",
                    }),
                    option: (base, { isSelected, isFocused }) => ({
                      ...base,
                      backgroundColor: isSelected
                        ? "#5BAA76" // ✅ Selected stays green
                        : isFocused
                          ? "#A5D6A7" // ✅ Light green on hover
                          : "white",
                      color: isSelected ? "white" : "black",
                      fontWeight: isSelected ? "600" : "normal", // ✅ Semi-bold when selected
                      "&:hover": {
                        backgroundColor: "#5BAA76",
                        color: "white",
                      },
                      "&:active": {
                        backgroundColor: "#5BAA76",
                      },
                    }),
                    singleValue: (base) => ({
                      ...base,
                      color: "black", // ✅ Selected value should be black
                      fontWeight: "semibold", // ✅ Selected value should be semi-bold
                    }),
                  }}
                />
              )}
            </div>


            <div style={{
              width: "max-content",
              maxWidth: "21%",
              minWidth: "14%",
              flex: "0.2",
              whiteSpace: 'nowrap',
              position: 'relative',
              zIndex: 1000
            }}>
              <label htmlFor="tract" className="block text-sm font-medium text-gray-700">Central Tract</label>
              {loadingAnalysisNewData ? (
                <div>Loading tracts...</div>
              ) : (
                <Select
                  id="tract"
                  value={filters.tract}
                  onChange={(selectedOption) => handleFilterChange('tract', selectedOption)}
                  options={tractsData}
                  placeholder="Tract ID"
                  isDisabled={!filters?.county?.value}
                  styles={{
                    control: (base, state) => ({
                      ...base,
                      borderColor: state.isFocused || state.hasValue ? "#5BAA76" : base.borderColor,
                      boxShadow:
                        state.isFocused || state.hasValue
                          ? "0px 2px 4px rgba(91, 170, 118, 0.3)" // Always show shadow if selected
                          : "none",
                      transition: "all 0.2s ease-in-out",
                      "&:hover": {
                        borderColor: "#5BAA76",
                      },
                    }),
                    placeholder: (base) => ({
                      ...base,
                      color: "#C5C5C5",
                      fontSize: "12px",

                    }),
                    option: (base, { isSelected, isFocused }) => ({
                      ...base,
                      backgroundColor: isSelected
                        ? "#5BAA76" // ✅ Selected stays green
                        : isFocused
                          ? "#A5D6A7" // ✅ Light green on hover
                          : "white",
                      color: isSelected ? "white" : "black",
                      fontWeight: isSelected ? "600" : "normal", // ✅ Semi-bold when selected
                      "&:hover": {
                        backgroundColor: "#5BAA76",
                        color: "white",
                      },
                      "&:active": {
                        backgroundColor: "#5BAA76",
                      },
                    }),
                    singleValue: (base) => ({
                      ...base,
                      color: "black", // ✅ Selected value should be black
                      fontWeight: "semibold", // ✅ Selected value should be semi-bold
                    }),
                  }}
                />
              )}
            </div>






            <div className="mt-5 flex flex-row gap-4" style={{
              width: "max-content",
              maxWidth: "21%",
              minWidth: "21%",
              flex: "0.2",
              whiteSpace: 'nowrap'
            }}>
              <Button className="w-full bg-[#5BAA76] text-white hover:bg-[#5BAA76]" disabled={loadingAnalysisNewData || loadingAnalysisData} onClick={handleApply}>
                Apply
              </Button>
              <Button className="w-full bg-transparent text-black font-medium border border-[#5BAA76] rounded-md hover:bg-[#ffffff] hover:text-black transition" disabled={!isClearButtonEnabled} onClick={handleClear}>
                Reset
              </Button>

            </div>
          </div>
        </div>


        <div style={{ marginTop: '15%' }}>
          <div className="flex items-center gap-4" style={{ marginTop: '10%' }}>
            <p className="flex items-center text-base font-semibold text-black-600 font-neris gap-1 m-0 whitespace-nowrap">
              Litter Prediction Map:
              <FaInfoCircle
                className="text-[#3AAD73] cursor-pointer"
                style={{ marginBottom: '20px', marginLeft:'27%'}}
                title={`The prediction map is powered by a proprietary ML model that analyzes factors such as location, traffic, weather, and population. Litter density is represented on a percentile scale: Very Low (0–20%), Low (20–40%), Medium (40–60%), High (60–80%), and Very High (80–100%)`}
              />
            </p>

            {loadingAnalysisData ? (
              <span className="text-sm text-gray-500">Loading...</span>
            ) : (
              <select
                id="week-select"
                value={selectedWeekId}
                onChange={(e) => {
                  setSelectedWeekId(e.target.value);
                  handleApplySelectedWeek(e.target.value);
                }}
                className="w-full max-w-xs border border-gray-300 rounded px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#5BAA76] font-neris"
              >
                <option value="" disabled>Select a Week</option>
                {weeks

                  ?.filter(({ status }) => status === "enable")

                  .map(({ week_id, week }) => (
                    <option key={week_id} value={week_id}>

                      {week}
                    </option>

                  ))}

              </select>
            )}
          </div>
        </div>





        <div className="w-full h-96">
          {loadingMapData ? (
            <div className="flex justify-center items-center h-full p-1">
              <span className="text-xl text-gray-400">Loading map...</span>
            </div>
          ) : (
            <MapPrediction markers={markers} zoom={zoom} center={center} switches={switches} eventData={eventData} binData={binData} amenitiesData={amenitiesData} amenitiesRetail={amenitiesRetail} amenitiesEntertainment={amenitiesEntertainment} amenitiesTransit={amenitiesTransit} amenitiesEducation={amenitiesEducation} />
          )}
        </div>

        <div style={{ display: 'flex', width: '100%', justifyContent: 'space-between', gap: '20px' }}>
          {/* Litter Density Filter Box*/}
          <div className="w-[330px] bg-white shadow-md  p-4 border rounded-sm border-gray-200" style={{ width: '46%' }}>
            <p className="text-xs text-gray-600 font-medium mb-3 whitespace-nowrap text-left">
            Litter Density Filters
            </p>

            <div className="grid grid-cols-2 gap-x-3 gap-y-2">
              {/* All */}
              <div
                className={`flex items-center gap-2 px-3 py-1 cursor-pointer border border-gray-300 rounded-full w-fit
        ${selectedColor === '#800080' ? 'bg-[#DCFCE7]' : 'bg-white'}`}
                style={{ width: '68%' }}
                onClick={() => {
                  setSelectedColor('#800080');
                  handleFilterColor('#800080');
                }}
              >
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: '#A9A9A9' }}></div>
                <span className="text-xs text-gray-700 font-medium">All</span>
              </div>

              {/* Medium */}
              <div
                className={`flex items-center gap-2 px-3 py-1 cursor-pointer border border-gray-300 rounded-full w-fit
        ${selectedColor === '#FFFF00' ? 'bg-[#DCFCE7]' : 'bg-white'}`}
                style={{ width: '68%' }}
                onClick={() => {
                  setSelectedColor('#FFFF00');
                  handleFilterColor('#FFFF00');
                }}
              >
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: '#FFD700', }}></div>
                <span className="text-xs text-gray-700 font-medium">Medium</span>
              </div>

              {/* Very High */}
              <div
                className={`flex items-center gap-2 px-3 py-1 cursor-pointer border border-gray-300 rounded-full w-fit
        ${selectedColor === '#FF0000' ? 'bg-[#DCFCE7]' : 'bg-white'}`}
                onClick={() => {
                  setSelectedColor('#FF0000');
                  handleFilterColor('#FF0000');
                }}
              >
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: '#FF0000' }}></div>
                <span className="text-xs text-gray-700 font-medium">Very High</span>
              </div>

              {/* Low */}
              <div
                className={`flex items-center gap-2 px-3 py-1 cursor-pointer border border-gray-300 rounded-full w-fit
        ${selectedColor === '#80FF00' ? 'bg-[#DCFCE7]' : 'bg-white'}`}
                style={{ width: '68%' }}
                onClick={() => {
                  setSelectedColor('#80FF00');
                  handleFilterColor('#80FF00');
                }}
              >
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: '#7CFC00' }}></div>
                <span className="text-xs text-gray-700 font-medium">Low</span>
              </div>

              {/* High */}
              <div
                className={`flex items-center gap-2 px-3 py-1 cursor-pointer border border-gray-300 rounded-full w-fit
        ${selectedColor === '#FF8000' ? 'bg-[#DCFCE7]' : 'bg-white'}`}
                style={{ width: '68%' }}
                onClick={() => {
                  setSelectedColor('#FF8000');
                  handleFilterColor('#FF8000');
                }}
              >
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: '#FFA500' }}></div>
                <span className="text-xs text-gray-700 font-medium">High</span>
              </div>

              {/* Very Low */}
              <div
                className={`flex items-center gap-2 px-3 py-1 cursor-pointer border border-gray-300 rounded-full w-fit
        ${selectedColor === '#008000' ? 'bg-[#DCFCE7]' : 'bg-white'}`}
                style={{ width: '68%' }}
                onClick={() => {
                  setSelectedColor('#008000');
                  handleFilterColor('#008000');
                }}
              >
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: '#006400' }}></div>
                <span className="text-xs text-gray-700 font-medium">Very Low</span>
              </div>
            </div>
          </div>

          {/* filter checkbox */}
          <div className="bg-white p-4 rounded-sm  shadow-md border " style={{ width: '46%' }} >
            <p className="text-left text-xs font-medium text-gray-600 mb-4">
            Toggle Map Layers
            </p>
            <div className="grid grid-cols-2 grid-rows-3 gap-4 text-xs">
              {loadingEventData ? <>Loading...</> : (
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={switches.events}
                    onChange={handleChange("events")}
                    className="appearance-none w-4 h-4 border border-gray-400 rounded-sm checked:bg-[#5BAA76] checked:border-[#5BAA76] checked:text-white text-white flex items-center justify-center checked:after:content-['✔'] checked:after:text-white checked:after:text-xs checked:after:font-bold checked:after:block"
                  />
                  <img src="/Medium.svg" alt="Marker" className="w-1 h-3" />
                  <span className="text-black">Events</span>
                </label>


              )}

              {loadingBinData ? <>Loading...</> : (
                <label className="flex items-center gap-2 text-gray-800">
                  <input
                    type="checkbox"
                    checked={switches.bins}
                    onChange={handleChange("bins")}
                    className="appearance-none w-4 h-4 border border-gray-400 rounded-sm checked:bg-[#5BAA76] checked:border-[#5BAA76] checked:text-white text-white flex items-center justify-center checked:after:content-['✔'] checked:after:text-white checked:after:text-xs checked:after:font-bold checked:after:block"
                  />
                  <img src="/bins.svg" alt="Marker" className="w-3 h-5" />
                  Bins
                </label>
              )}

              {loadingAmenitiesData ? <>Loading...</> : (
                <label className="flex items-center gap-1 text-gray-800">
                  <input
                    type="checkbox"
                    checked={switches.transit}
                    onChange={handleChange("transit")}
                    className="appearance-none w-4 h-4 border border-gray-400 rounded-sm checked:bg-[#5BAA76] checked:border-[#5BAA76] checked:text-white text-white flex items-center justify-center checked:after:content-['✔'] checked:after:text-white checked:after:text-xs checked:after:font-bold checked:after:block"
                  />
                  <img src="/transit.svg" alt="Marker" className="w-3 h-5" />
                  Transit
                </label>
              )}

              {loadingAmenitiesData ? <>Loading...</> : (
                <label className="flex items-center gap-2 text-gray-800">
                  <input
                    type="checkbox"
                    checked={switches.retail}
                    onChange={handleChange("retail")}
                    className="appearance-none w-4 h-4 border border-gray-400 rounded-sm checked:bg-[#5BAA76] checked:border-[#5BAA76] checked:text-white text-white flex items-center justify-center checked:after:content-['✔'] checked:after:text-white checked:after:text-xs checked:after:font-bold checked:after:block"
                  />
                  <img src="/retail.svg" alt="Marker" className="w-3 h-5" />
                  Retail + F&B
                </label>
              )}

              {loadingAmenitiesData ? <>Loading...</> : (
                <label className="flex items-center gap-1 text-gray-800">
                  <input
                    type="checkbox"
                    checked={switches.entertainment}
                    onChange={handleChange("entertainment")}
                    className="appearance-none w-4 h-4 border border-gray-400 rounded-sm checked:bg-[#5BAA76] checked:border-[#5BAA76] checked:text-white text-white flex items-center justify-center checked:after:content-['✔'] checked:after:text-white checked:after:text-xs checked:after:font-bold checked:after:block"
                  />
                  <img src="/entertainment.svg" alt="Marker" className="w-3 h-5" />
                  Entertainment
                </label>
              )}

              {loadingAmenitiesData ? <>Loading...</> : (
                <label className="flex items-center gap-2 text-gray-800">
                  <input
                    type="checkbox"
                    checked={switches.education}
                    onChange={handleChange("education")}
                    className="appearance-none w-4 h-4 border border-gray-400 rounded-sm checked:bg-[#5BAA76] checked:border-[#5BAA76] checked:text-white text-white flex items-center justify-center checked:after:content-['✔'] checked:after:text-white checked:after:text-xs checked:after:font-bold checked:after:block"
                  />
                  <img src="/education.svg" alt="Marker" className="w-3 h-5" />
                  Education
                </label>
              )}
            </div>
            <div className="mt-1 flex justify-between items-center w-full">
              {/* Left legend - always shown */}
              <div className="flex items-center gap-4 mt-2">
                {switches?.events && (
                  <div className="flex items-center gap-4 mt-2">
                    <span className="text-xs text-gray-400 whitespace-nowrap">Low Impact Events</span>
                    <div className="w-10 h-2 bg-gradient-to-r from-[#de9ed8] via-[#bc32ac] to-[#532476] rounded-full"></div>
                    <span className="text-xs text-gray-400 whitespace-nowrap">High Impact Events</span>
                  </div>
                )}
                {/* <span className="text-xs text-gray-400">Lower Litter Density</span>
            <div className="w-20 h-2 bg-gradient-to-r from-[#008000] via-[#FFFF00] to-[#FF0000] rounded-full"></div>
            <span className="text-xs text-gray-400 whitespace-nowrap">Higher Litter Density</span> */}
              </div>
            </div>
          </div>



        </div>


      </div>


      <div className="w-1/5 p-4  space-y-6  bg-white rounded-lg shadow-md" style={{ marginLeft: '2%', position: 'absolute', right: '0px', height: '48rem' }}>




        <div className="p-4 bg-[#DCFCE7] rounded flex flex-col justify-center items-center text-center">
          {loadingAnalysisData ? (
            <span>Loading Data...</span>
          ) : (
            <span className="block text-2xl font-bold text-green-700">{predictionData?.total?.["Total Estimated Litter"]}<span className="text-sm text-green-700">(#)</span></span>
          )}
          <p className="mt-4 text-black text-base font-semibold font-neris whitespace-nowrap">Predicted Litter Quantity</p>

        </div>


        <div className="p-4 bg-[#DCFCE7] rounded flex flex-col justify-center items-center text-center">

          {loadingAnalysisData ? (
            <span>Loading Data...</span>
          ) : (
            <span className="block text-2xl font-bold text-green-700">{predictionData?.total?.["Estimated Litter Density"]}<span className="text-sm text-green-700">(# / sq. miles)</span></span>
          )}
          <p className="mt-4 text-black text-base font-semibold font-neris whitespace-nowrap">
            Predicted Litter Density
          </p>

        </div>

        <div className="h-auto">
          {/* <Bar options={options} data={data} /> */}
          <p className="text-base font-semibold font-neris" >Break Down of Litter Types</p>
          <div className="h-[300px]">
            <Doughnut
              data={dataDoughnut}
              options={optionsDoughnut}
            />
          </div>

        </div>


      </div>

    </div>


  );
}

export default Prediction;
