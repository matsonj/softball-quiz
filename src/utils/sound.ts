export const playPingSound = () => {
  try {
    const audio = new Audio('/sounds/ping.mp3');
    audio.volume = 0.5;
    
    // Start at 1.5 seconds and play for 2 seconds
    audio.currentTime = 1.5;
    
    // Stop the audio after 2 seconds of playback
    setTimeout(() => {
      audio.pause();
      audio.currentTime = 0;
    }, 2000);
    
    audio.play().catch(error => {
      console.log('Audio play failed:', error);
    });
  } catch (error) {
    console.log('Audio creation failed:', error);
  }
};
