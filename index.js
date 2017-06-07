function handleFetchErrors(res) {
  if (!res.ok) {
    throw Error(res.statusText);
  }
  return res;
}

const Loader = ({ color, size, weight }) => {
  const radius = size / 2;
  const r = radius - (weight / 2);
  const dasharray = Math.round(radius * Math.PI);
  return (
    <div className="loader">
      <svg height={size} width={size}>
        <circle
          cx={radius}
          cy={radius}
          fill="none"
          r={r}
          stroke={color}
          strokeLinecap="round"
          strokeWidth={weight}
          strokeDasharray={dasharray}
          strokeDashoffset={radius}
        />
      </svg>
    </div>
  );
};

Loader.propTypes = {
  size: React.PropTypes.number.isRequired,
  color: React.PropTypes.string.isRequired,
  weight: React.PropTypes.number.isRequired,
};

const ErrorMessage = ({ message }) => (
  <div className="message message--error">
    Error: {message}
  </div>
);

ErrorMessage.propTypes = {
  message: React.PropTypes.string.isRequired,
};

const Image = ({ className, src, alt }) => (
  <img
    className={className}
    src={src}
    alt={alt}
  />
);

Image.defaultProps = {
  alt: '',
};

Image.propTypes = {
  className: React.PropTypes.string.isRequired,
  src: React.PropTypes.string.isRequired,
  alt: React.PropTypes.string,
};

const ImageWrapper = ({ id, openImage, src, tabindex, title }) => (
  <div
    className="gallery__item"
    role="button"
    onClick={() => { openImage(id); }}
    tabIndex={tabindex}
  >
    <div className="gallery__overlay">
      <h2>{title}</h2>
    </div>
    <Image
      className="gallery__image"
      src={src}
      alt={src}
    />
  </div>
);

ImageWrapper.propTypes = {
  id: React.PropTypes.string.isRequired,
  title: React.PropTypes.string.isRequired,
  src: React.PropTypes.string.isRequired,
  tabindex: React.PropTypes.number.isRequired,
  openImage: React.PropTypes.func.isRequired,
};

const LightBox = ({ image, closeImage }) => (
  <div className="lightbox fade-in">
    <div className="lightbox__wrapper">
      <button className="lightbox__btn lightbox__btn--close" onClick={closeImage}>&times;</button>
      <Image
        className="lightbox__image"
        src={image.src}
        alt={image.desc}
      />
    </div>
  </div>
);

LightBox.propTypes = {
  image: React.PropTypes.objectOf(
    React.PropTypes.string.isRequired,
  ).isRequired,
  closeImage: React.PropTypes.func.isRequired,
};

const Gallery = ({ images, openImage }) => {
  const imageWrapper = images.map(({ id, title, src }, i) => (
    <ImageWrapper
      key={id}
      id={id}
      tabindex={i + 1}
      title={title}
      src={src}
      openImage={openImage}
    />
  ));
  return (
    <div className="gallery fade-in">
      {imageWrapper}
    </div>
  );
};

Gallery.propTypes = {
  images: React.PropTypes.arrayOf(
    React.PropTypes.object
  ).isRequired,
  openImage: React.PropTypes.func.isRequired,
};

class App extends React.Component {
  constructor() {
    super();
    this.state = {
      activeId: null,
      error: null,
      images: [],
      user: null,
      followers: 0,
      galleryTitle: '',
      isLoading: true,
    };
    this.handleKeyUp = this.handleKeyUp.bind(this);
    this.openImage = this.openImage.bind(this);
    this.closeImage = this.closeImage.bind(this);
  }
  componentDidMount() {
    document.addEventListener('keyup', this.handleKeyUp);
    setTimeout(() => {
      fetch('//databro.com/16062/images.json')
      .then(handleFetchErrors)
      .then(res => res.json())
      .then(({ user, gallery, images }) => {
        this.setState({
          isLoading: false,
          images,
          user: user.name,
          followers: user.followers,
          galleryTitle: gallery.title,
        });
      })
      .catch((err) => {
        this.setState({
          error: err.message,
        });
      });
    }, 2e3);
  }
  componentWillUnmount() {
    document.removeEventListener('keyup', this.handleKeyUp);
  }
  handleKeyUp(event) {
    if (event.which === 27 && this.state.activeId !== null) {
      this.closeImage();
    }
  }
  openImage(id) {
    this.setState({
      activeId: id,
    });
  }
  closeImage() {
    this.setState({
      activeId: null,
    });
  }
  render() {
    let content;
    const { error, isLoading, activeId, images } = this.state;

    if (error) {
      content = (
        <ErrorMessage message={error} />
      );
    } else if (isLoading) {
      content = (
        <Loader size={200} weight={10} color="rgba(0, 0, 0, 0.2)" />
      );
    } else if (activeId !== null) {
      content = (
        <LightBox
          image={images.filter(img => activeId === img.id)[0]}
          closeImage={this.closeImage}
        />
      );
    } else {
      content = (
        <Gallery
          images={this.state.images}
          openImage={this.openImage}
        />
      );
    }
    return (
      <div className="app">
        <h1 className="app__title">React Image Gallery</h1>
        {!this.state.isLoading && <header className="gallery__header">
          <h2 className="gallery__title">{this.state.galleryTitle}</h2>
          <div className="gallery__stats">
            <span>by @{this.state.user}</span>
            <span>{this.state.images.length} photos</span> <span>{this.state.followers} followers</span>
          </div>
        </header>}
        {content}
      </div>
    );
  }
}

ReactDOM.render(<App />, document.getElementById('app'));
