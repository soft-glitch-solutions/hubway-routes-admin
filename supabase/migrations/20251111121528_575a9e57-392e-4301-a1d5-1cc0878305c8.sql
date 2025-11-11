-- Enable Row Level Security on request tables
ALTER TABLE price_change_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE hub_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE stop_requests ENABLE ROW LEVEL SECURITY;