import { ArrowRight, Camera, Dumbbell, BarChart3 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import Navbar from "../components/Navbar"

export default function HomePage() {
    const navigate = useNavigate();

    const features = [
      {
        icon: <Camera className="h-6 w-6" />,
        title: "Capture Your Technique",
        description: "Upload or record videos of your volleyball hits for AI analysis"
      },
      {
        icon: <Dumbbell className="h-6 w-6" />,
        title: "Compare with Pros",
        description: "Side-by-side comparison with professional volleyball players"
      },
      {
        icon: <BarChart3 className="h-6 w-6" />,
        title: "Detailed Feedback",
        description: "Receive personalized insights to improve your form and technique"
      }
    ];


    return (
      <>
      <Navbar />
      
      <div className="min-h-[calc(100vh-8rem)] flex flex-col">
        <div className="flex-1 flex flex-col justify-center items-center text-center py-12">
          <motion.div
            className="space-y-6 max-w-3xl"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="space-y-2">
              <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
                Perfect Your Swing with AI Analysis
              </h1>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Upload videos of your volleyball swing, compare with professionals, and receive detailed feedback to improve your technique.
              </p>
            </div>

            <div className="pt-4">
            <button
              className="flex items-center justify-center rounded-full px-8 h-12 bg-gradient-to-r from-blue-500 to-indigo-600 text-white 
              font-semibold transition-transform transform hover:scale-105 hover:shadow-lg focus:outline-none focus:ring-4 focus:ring-blue-300 mx-auto"
              onClick={() => navigate("/upload")}
            >
              Start Analysis
              <ArrowRight className="ml-2 h-5 w-5" />
            </button>

            </div>
          </motion.div>

          <motion.div
            className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto mt-20"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            {features.map((feature, i) => (
              <div>
                  <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-4 mx-auto text-primary">
                  {feature.icon}
                </div>
                <h3 className="text-lg font-medium mb-2">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </div>


            ))}
          </motion.div>
        </div>
        <motion.div
          className="mt-auto py-8 border-t"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <div className="text-center text-sm text-muted-foreground">
            <p>This is an application showcasing pose estimation and comparison capabilities.</p>
            <p className="mt-1">
              The application uses Google's pose landmark detection for pose estimation.
            </p>
          </div>
        </motion.div>  
        </div>
        </>

  );
};

