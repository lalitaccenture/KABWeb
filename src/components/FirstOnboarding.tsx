import { Button } from "@/components/ui/button";

// Define the props interface
interface ChildComponentProps {
  setShowSecondComponent: (value: boolean) => void;
}

const FirstOnboarding: React.FC<ChildComponentProps> = ({ setShowSecondComponent }) => {
  return (
    <>
      <div className="flex items-center justify-center mt-14 font-neris">
        <h1 className="text-2xl font-normal ">Welcome to the Litter Mapping Tool!</h1>
      </div>
      <div className="flex items-center justify-center mt-10 ml-14 mr-14 font-neris">
        <p className="text-2xl font-normal items-center justify-center">
          We are so excited to have you join our community of environmental champions.
        </p>
      </div>
      <div className="flex items-center justify-center mt-10">
        <Button
          style={{
            backgroundColor: '#5BAA76',
            color: 'white',
            width: '424px',
            borderRadius: '32px',
          }}
          className="hover:bg-green-600 transition-colors duration-300"
          onClick={() => setShowSecondComponent(true)}
        >
          Let's explore
        </Button>
      </div>
    </>
  )
}

export default FirstOnboarding;