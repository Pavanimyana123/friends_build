
import React, { useEffect, useState } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import InputField from '../../../Pages/InputField/InputField';
import './Worker.css';
import axios from "axios";
import Navbar from '../../../Pages/Navbar/Navbar';
import { Row, Col, Button } from 'react-bootstrap';
import baseURL from '../../../../Url/NodeBaseURL';


function Worker_Master() {
  const [isSaving, setIsSaving] = useState(false);
  const location = useLocation();
  const [formData, setFormData] = useState({
    account_name: '',
    print_name: '',
    account_group: 'WORKER',
    address1: '',
    address2: '',
    city: '',
    pincode: '',
    state: '',
    state_code: '',
    phone: '',
    mobile: '',
    email: '',
    birthday: '',
    anniversary: '',
    bank_account_no: '',
    bank_name: '',
    ifsc_code: '',
    branch: '',
    gst_in: '',
    aadhar_card: '',
    pan_card: '',
  });
  const [existingMobiles, setExistingMobiles] = useState([]); // Track existing mobile numbers


  const navigate = useNavigate();
  const { id } = useParams(); // Get ID from URL
  const [states, setStates] = useState([]);


  useEffect(() => {
    // Fetch existing workers to check for duplicate mobile numbers
    const fetchWorkers = async () => {
      try {
        const response = await fetch(`${baseURL}/get/account-details`);
        if (response.ok) {
          const result = await response.json();
          const mobiles = result
            .filter((item) => item.account_group === 'WORKER')
            .map((item) => item.mobile);
          setExistingMobiles(mobiles);
        }
      } catch (error) {
        console.error('Error fetching workers:', error);
      }
    };

    // Fetch specific workers if editing
    const fetchWorker = async () => {
      if (id) {
        try {
          const response = await fetch(`${baseURL}/account/${id}`);
          if (response.ok) {
            const result = await response.json();
            // Parse dates without timezone adjustment
            const parseDate = (dateString) => {
              if (!dateString) return '';
              const date = new Date(dateString);
              const year = date.getFullYear();
              const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are 0-based
              const day = String(date.getDate()).padStart(2, '0');
              return `${year}-${month}-${day}`;
            };

            setFormData({
              ...result,
              birthday: parseDate(result.birthday),
              anniversary: parseDate(result.anniversary),
            });
          }
        } catch (error) {
          console.error('Error fetching worker:', error);
        }
      }
    };

    fetchWorkers();
    fetchWorker();
  }, [id]);

  useEffect(() => {
    const fetchStates = async () => {
      try {
        const response = await axios.get(`${baseURL}/states`);
        setStates(response.data);
      } catch (error) {
        console.error("Error fetching states:", error);
      }
    };
    fetchStates();
  }, []);

 
  const handleChange = (e) => {
    const { name, value } = e.target;
    let updatedValue = value.trimStart(); // Prevent leading spaces

    // Define regex patterns for validation
    const alphabetRegex = /^[A-Za-z\s]*$/; // Only letters & spaces
    const numericRegex = /^\d*$/; // Only numbers
    const alphanumericRegex = /^[A-Za-z0-9]*$/; // Only alphanumeric (no special chars)

    switch (name) {
      case "account_name":
      case "print_name":
        // Allow only alphabets and spaces
        if (!alphabetRegex.test(updatedValue)) return;

        // Capitalize first letter
        updatedValue = updatedValue.charAt(0).toUpperCase() + updatedValue.slice(1);

        setFormData((prevData) => ({
          ...prevData,
          [name]: updatedValue,
          ...(name === "account_name" &&
            prevData.print_name === prevData.account_name && {
            print_name: updatedValue,
          }),
        }));
        return;

      case "mobile":
      case "phone":
        // Allow only numbers and limit to 10 digits
        updatedValue = updatedValue.replace(/\D/g, "").slice(0, 10);
        break;

      case "aadhar_card":
        // Allow only numbers and limit to 12 digits
        updatedValue = updatedValue.replace(/\D/g, "").slice(0, 12);
        break;

      case "pincode":
        // Allow only numbers and limit to 6 digits
        updatedValue = updatedValue.replace(/\D/g, "").slice(0, 6);
        break;

      case "gst_in":
        // GSTIN must be 15 alphanumeric characters (uppercase)
        if (!alphanumericRegex.test(updatedValue)) return;
        updatedValue = updatedValue.toUpperCase().slice(0, 15);
        break;

      case "pan_card":
        // PAN must be 10 alphanumeric characters (uppercase)
        if (!alphanumericRegex.test(updatedValue)) return;
        updatedValue = updatedValue.toUpperCase().slice(0, 10);
        break;

      case "ifsc_code":
        // IFSC must be exactly 11 alphanumeric characters (uppercase)
        if (!alphanumericRegex.test(updatedValue)) return;
        updatedValue = updatedValue.toUpperCase().slice(0, 11);
        break;

      case "bank_account_no":
        // Allow only numbers and reasonable length (6-18 digits)
        updatedValue = updatedValue.replace(/\D/g, "").slice(0, 18);
        break;

      default:
        break;
    }

    // Update state
    setFormData((prevData) => ({
      ...prevData,
      [name]: updatedValue,
    }));
  };
  
  const validateForm = () => {
    if (!formData.account_name?.trim()) {
      alert("Account name is required.");
      return false;
    }
    if (!formData.mobile?.trim()) {
      alert("Mobile number is required.");
      return false;
    }
    if (!formData.email?.trim()) {
      alert("Email is required.");
      return false;
    }

    // Email validation using regex
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(formData.email)) {
      alert("Invalid email format.");
      return false;
    }

    if (formData.pincode?.trim() && formData.pincode.length !== 6) {
      alert("PinCode must be exactly 6 digits.");
      return false;
    }
    if (formData.aadhar_card?.trim() && formData.aadhar_card.length !== 12) {
      alert("Aadhar Card must be exactly 12 digits.");
      return false;
    }
    if (formData.pan_card?.trim() && formData.pan_card.length !== 10) {
      alert("PAN Card must be exactly 10 characters.");
      return false;
    }
    if (formData.gst_in?.trim() && formData.gst_in.length !== 15) {
      alert("GSTIN must be exactly 15 characters.");
      return false;
    }
    if (formData.ifsc_code?.trim() && formData.ifsc_code.length !== 11) {
      alert("IFSC Code must be exactly 11 characters.");
      return false;
    }
    if (formData.bank_account_no?.trim() && (formData.bank_account_no.length < 6 || formData.bank_account_no.length > 18)) {
      alert("Bank Account Number must be between 6 and 18 digits.");
      return false;
    }

    return true;
  };



  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
  
    if (!validateForm()) {
      setIsSaving(false); // Ensure button is re-enabled when validation fails
      return;
    }
  
    try {
      // Uncomment this section if you need duplicate mobile validation
      // if (!id) {
      //   const response = await fetch(`${baseURL}/get/account-details`);
      //   if (!response.ok) {
      //     throw new Error("Failed to fetch data for duplicate check.");
      //   }
      //   const result = await response.json();
      //   const isDuplicateMobile = result.some((item) => item.mobile === formData.mobile);
  
      //   if (isDuplicateMobile) {
      //     alert("This mobile number is already associated with another entry.");
      //     setIsSaving(false); // Ensure button is re-enabled
      //     return;
      //   }
      // }
  
      // Proceed with saving the record (POST or PUT)
      const method = id ? "PUT" : "POST";
      const endpoint = id
        ? `${baseURL}/update-account/${id}`
        : `${baseURL}/add-account`;
  
      const saveResponse = await fetch(endpoint, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ ...formData }),
      });
  
      if (saveResponse.ok) {
        alert(`Worker ${id ? "updated" : "created"} successfully!`);
        navigate("/a-workertable");
      } else {
        alert("Failed to save worker.");
      }
    } catch (error) {
      console.error("Error:", error);
      alert("An error occurred while processing the request.");
    } finally {
      setIsSaving(false); // Ensure button is re-enabled after submission
    }
  };
  

  const handleBack = () => {
    const from = location.state?.from || "/a-workertable";
    navigate(from);
  };



  useEffect(() => {
    const fetchStates = async () => {
      try {
        const response = await axios.get(`${baseURL}/get/states`);
        setStates(response.data); // Assuming `states` is a state variable to store states data
      } catch (error) {
        console.error("Error fetching states:", error);
      }
    };
    fetchStates();
  }, []);

  const handleStateChange = (e) => {
    const selectedState = states.find((state) => state.state_name === e.target.value);
    setFormData({
      ...formData,
      state: selectedState?.state_name || "",
      state_code: selectedState?.state_code || "",
    });
  };


  return (
    <>
      <Navbar />
      <div className="main-container">
        <div className="worker-master-container">
          <h2>{id ? 'Edit Worker' : 'Add Worker'}</h2>
          <form className="worker-master-form" onSubmit={handleSubmit}>
            {/* Row 1 */}
            <Row>
              <Col md={4}>
                <InputField
                  label="Trade / Worker Name"
                  name="account_name"
                  value={formData.account_name}
                  onChange={handleChange}
                  required
                />
              </Col>
              <Col md={4}>
                <InputField
                  label="Print Name"
                  name="print_name"
                  value={formData.print_name}
                  onChange={handleChange}
                  required
                />
              </Col>
              {/* <Col md={4}>
      <InputField
        label="Account Group:"
        name="account_group"
        value="WORKER"
        readOnly
      />
    </Col> */}
              <Col md={4}>
                <InputField
                  label="Address1"
                  name="address1"
                  value={formData.address1}
                  onChange={handleChange}

                />
              </Col>

              <Col md={4}>
                <InputField
                  label="Address2"
                  name="address2"
                  value={formData.address2}
                  onChange={handleChange}

                />
              </Col>
              <Col md={4}>
                <InputField
                  label="City"
                  name="city"
                  value={formData.city}
                  onChange={handleChange}

                />
              </Col>
              <Col md={4}>
                <InputField
                  label="Pincode"
                  name="pincode"
                  value={formData.pincode}
                  onChange={handleChange}

                />
              </Col>


              <Col md={3}>
                <InputField
                  label="State"
                  name="state"
                  type="select"
                  value={formData.state}
                  onChange={handleStateChange} // Use handleStateChange to update the state and state_code
                  options={states.map((state) => ({
                    value: state.state_name,
                    label: state.state_name,
                  }))}
                />
              </Col>
              <Col md={3}>
                <InputField label="State Code:" name="state_code" value={formData.state_code} onChange={handleChange} readOnly />
              </Col>
              <Col md={3}>
                <InputField
                  label="Phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}

                />
              </Col>
              <Col md={3}>
                <InputField
                  label="Mobile"
                  name="mobile"
                  value={formData.mobile}
                  onChange={handleChange}
                  required
                />
              </Col>
              <Col md={4}>
                <InputField
                  label="Email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}

                />
              </Col>

              <Col md={2}>
                <InputField
                  label="Birthday"
                  name="birthday"
                  type="date"
                  value={formData.birthday}
                  onChange={handleChange}

                />
              </Col>
              <Col md={2}>
                <InputField
                  label="Anniversary"
                  name="anniversary"
                  type="date"
                  value={formData.anniversary}
                  onChange={handleChange}

                />
              </Col>
              <Col md={4}>
                <InputField
                  label="Bank Account No"
                  name="bank_account_no"
                  value={formData.bank_account_no}
                  onChange={handleChange}

                />
              </Col>
              <Col md={3}>
                <InputField
                  label="Bank Name"
                  name="bank_name"
                  value={formData.bank_name}
                  onChange={handleChange}

                />
              </Col>

              <Col md={3}>
                <InputField
                  label="IFSC Code"
                  name="ifsc_code"
                  value={formData.ifsc_code}
                  onChange={handleChange}

                />
              </Col>
              <Col md={3}>
                <InputField
                  label="Branch"
                  name="branch"
                  value={formData.branch}
                  onChange={handleChange}

                />
              </Col>
              <Col md={3}>
                <InputField
                  label="GSTIN"
                  name="gst_in"
                  value={formData.gst_in}
                  onChange={handleChange}

                />
              </Col>
              <Col md={4}>
                <InputField
                  label="Aadhar Card"
                  name="aadhar_card"
                  value={formData.aadhar_card}
                  onChange={handleChange}

                />
              </Col>
              <Col md={4}>
                <InputField
                  label="PAN Card"
                  name="pan_card"
                  value={formData.pan_card}
                  onChange={handleChange}

                />
              </Col>
            </Row>
            <div className="form-buttons">

              {/* <Button type="submit" variant="success" style={{ backgroundColor: '#a36e29', borderColor: '#a36e29' }}>Print</Button> */}
              <Button
                variant="secondary"
                onClick={handleBack} style={{ backgroundColor: 'gray', }}
              >
                cancel
              </Button>
              <Button
                type="submit"
                variant="success"
                style={{ backgroundColor: "#a36e29", borderColor: "#a36e29" }}
                onClick={handleSubmit}
                disabled={isSaving} // Disable button when saving
              >
                {isSaving ? (id ? "Updating..." : "Saving...") : id ? "Update" : "Save"}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}

export default Worker_Master;
