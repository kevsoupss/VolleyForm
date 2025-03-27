import { motion } from "framer-motion";
import LinearProgress from '@mui/material/LinearProgress';

const AnalysisLoading = () => {
  return (
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
            Please wait for analysis. 
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            It may take some time for pose estimation and analysis.
          </p>
        </div>

        <div className="pt-4">
          <LinearProgress />
        </div>
      </motion.div>
      </div>
      </div>
  )
}

export default AnalysisLoading
