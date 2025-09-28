type SpinnerProps = {
  fullscreen?: boolean;
};

const Spinner = ({ fullscreen = true }: SpinnerProps) => {
  if (fullscreen) {
    return (
      <div className="fixed inset-0 bg-black/50 overflow-y-auto h-full w-full flex justify-center items-center z-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 dark:border-gray-100"></div>
      </div>
    );
  }

  return (
    <div className="flex justify-center items-center p-4">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 dark:border-gray-100"></div>
    </div>
  );
};

export default Spinner;