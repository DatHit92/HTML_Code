const scenes = document.querySelectorAll('.scene');

const observer = new IntersectionObserver(entries => {

  entries.forEach(entry => {

    if(entry.isIntersecting){
      entry.target.classList.add('show');
    }

  });

}, {
  threshold:0.15
});

scenes.forEach(scene => {
  observer.observe(scene);
});
