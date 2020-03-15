import React, { useState, useEffect, useContext } from "react";
import SEO from "../components/SEO";
import Button from "../components/Button";
import { Link } from "react-router-dom";
import { AuthContext } from "../components/AuthContext";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { addMonths, setHours, setMinutes } from "date-fns";

function BookVenue() {
  const [meetingTitle, setMeetingTitle] = useState("");
  const [bookingDate, setBookingDate] = useState(new Date());
  const [description, setDescription] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [disabled, setDisabled] = useState(true);
  const [bookings, setBookings] = useState("");
  const [venue, setVenue] = useState();
  var id = sessionStorage.getItem("vId");
  var { user } = useContext(AuthContext);

  useEffect(() => {
    const getBookings = async () => {
      fetch(`/api/venue/${id}`)
        .then(response => {
          if (response.status === 200) {
            return response.json();
          }
        })
        .then(data => {
          if (data) {
            setVenue(data.body);
          }
        })
        .catch(error => console.log(error));
    };
    getBookings();
    // eslint-disable-next-line
  }, []);

  useEffect(() => {
    fetch(`/api/booking/${id}`)
      .then(response => {
        if (response.status === 200) {
          return response.json();
        }
      })
      .then(data => {
        if (data) {
          console.log(data.body);
          setBookings(data.body);
          console.log({ bookings });
        }
      })
      .catch(error => console.log(error));
    // eslint-disable-next-line
  }, []);

  const checkTwo = (date, stime, etime) => {
    bookings.map(booking => {
      if (date === booking.date) {
        if (stime >= booking.startTime && stime <= booking.endTime) {
          return true;
        } else if (etime <= booking.endTime && etime >= booking.startTime) {
          return true;
        } else {
          return false;
        }
      } else {
        return false;
      }
    });
  };

  const toShort = date => {
    return new Date(date)
      .toLocaleDateString("en-US", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric"
      });
  };

  const toHours = date => {
    return new Date(date).getHours();
  };

  const toMinutes = date => {
    return new Date(date).getMinutes();
  };

  const createBooking = event => {
    event.preventDefault();
    if (endTime <= startTime) {
      alert("End Time earlier than Start Time");
    } else if (checkTwo(bookingDate, startTime, endTime)) {
      alert(
        "Your selected duration has been booked. please select an unbooked time."
      );
    } else {
      try {
        fetch("/api/users/", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title: meetingTitle,
            date: bookingDate,
            startTime,
            endTime,
            venueId: id,
            description,
            userId: user._id
          })
        })
          .then(response => {
            if (response.status === 200) {
              alert("Venue booked successfully");
            } else if (response.status === 403) {
              console.log(response);
              alert(
                "The venue is booked at your specified time. Please pick another time!"
              );
            } else {
              alert("network error, please try again in a bit");
            }
          })
          .catch(err => {
            console.log(err);
          });
      } catch (error) {
        alert("Signup failed. Please try again");
        console.log(error);
      }
    }
  };

  if (venue) {
    return (
      <div className="container-fluid">
        <SEO
          title="Book!T | Book Venue"
          name="Book Venue"
          content={`Book a venue `}
        />
        <div className="row">
          <div className="col-md-3 calendar-board">
            <p className="check-availiability text-center text-capitalize m-3">
              {venue.name}
            </p>

            <img
              src={venue.image}
              className="venueImage"
              alt={venue.name}
            ></img>

            <p className="text-center mt-4">{venue.location}</p>

            <ul className="text-center mt-4 mb-4">
              {venue.features.map((feature, i) => (
                <li key={i}>{feature}</li>
              ))}
            </ul>
          </div>
          <div className="col-md-6">
            <div className="booking">
              <p>Book {venue.name}</p>
            </div>
            <div className="booking-board">
              <p>
                <b>New Booking</b>
              </p>
              <form
                onSubmit={event => {
                  event.preventDefault();
                  console.log(
                    bookingDate.toTimeString(),
                    { startTime },
                    { endTime },
                    toHours(startTime),
                    toMinutes(startTime)
                  );
                }}
                id="venue-booking"
              >
                <div className="form-group">
                  <label htmlFor="InputTitle">Event Title</label>
                  <input
                    type="text"
                    className="form-control"
                    id="InputTitle"
                    required
                    value={meetingTitle}
                    onChange={event => {
                      setMeetingTitle(event.target.value);
                    }}
                  />
                </div>
                <div className="form-row">
                  <div className="form-group col">
                    <label htmlFor="InputDate">Date</label>
                    <DatePicker
                      selected={bookingDate}
                      onChange={date => setBookingDate(date)}
                      minDate={new Date()}
                      maxDate={addMonths(new Date(), 2)}
                      className="form-control"
                      required
                    />
                  </div>
                  <div className="col-1"></div>
                  <div className="form-group col">
                    <label htmlFor="InputStartTime">Start Time</label>
                    <DatePicker
                      selected={startTime}
                      onChange={date => {setStartTime(date);
                      setDisabled(false)}}
                      showTimeSelect
                      showTimeSelectOnly
                      openToDate={new Date(toShort(bookingDate))}
                      minTime={setHours(setMinutes(new Date(), 0), 7)}
                      maxTime={setHours(setMinutes(new Date(), 0), 21)}
                      timeIntervals={15}
                      timeCaption="Time"
                      dateFormat="h:mm aa"
                      className="form-control"
                      required
                    />
                  </div>
                  <div className="col-1"></div>
                  <div className="form-group col">
                    <label htmlFor="InputEndTime">End Time</label>
                    <DatePicker
                      selected={endTime}
                      onChange={date => setEndTime(date)}
                      showTimeSelect
                      showTimeSelectOnly
                      openToDate={new Date(toShort(bookingDate))}
                      minTime={setHours(setMinutes(new Date(), (toMinutes(startTime)+15)), toHours(startTime))}
                      maxTime={setHours(setMinutes(new Date(), 0), 21)}
                      timeIntervals={15}
                      disabled = {disabled}
                      timeCaption="Time"
                      dateFormat="h:mm aa"
                      className="form-control"
                      required
                    />
                  </div>
                </div>
                <div className="form-group">
                  <label htmlFor="InputDescription">Description</label>
                  <textarea
                    className="form-control"
                    id="InputDescription"
                    value={description}
                    onChange={event => {
                      setDescription(event.target.value);
                    }}
                  />
                </div>
                <div className="booking-btn-container">
                  <Link to="/conference">
                    <Button defaultBtnColor="change-btn">Cancel</Button>
                  </Link>
                  <span style={{ marginLeft: "10px" }}></span>
                  <Button type="submit" defaultBtnColor="change-btn">
                    Book space
                  </Button>
                </div>
              </form>
            </div>
          </div>
          <div className="col-md-3 calendar-board">
            <p className="check-availiability text-center text-capitalize m-2">
              Venue Bookings
            </p>
          </div>
        </div>
      </div>
    );
  } else {
    return <h1>Please go back and select a venue</h1>;
  }
}

export default BookVenue;
