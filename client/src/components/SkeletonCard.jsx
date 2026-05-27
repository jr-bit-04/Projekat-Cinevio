function SkeletonCard() {
  return (
    <div className="skeleton-card">
      <div className="skeleton-poster"></div>

      <div className="skeleton-content">
        <div className="skeleton-line short"></div>
        <div className="skeleton-line"></div>
        <div className="skeleton-line tiny"></div>
      </div>
    </div>
  );
}

export default SkeletonCard;