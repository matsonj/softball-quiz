export const playPingSound = () => {
  try {
    const audio = new Audio('/sounds/ping.mp3');
    audio.volume = 0.5;
    audio.play().catch(error => {
      console.log('Audio play failed:', error);
    });
  } catch (error) {
    console.log('Audio creation failed:', error);
  }
};
