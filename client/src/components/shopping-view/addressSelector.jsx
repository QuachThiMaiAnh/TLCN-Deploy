import React, { useState } from "react";

const vietnamAddressData = {
  "Hồ Chí Minh": {
    "Quận 1": ["Phường Bến Nghé", "Phường Bến Thành", "Phường Cầu Kho"],
    "Quận 3": ["Phường Võ Thị Sáu", "Phường 7", "Phường 9"],
  },
  "Hà Nội": {
    "Quận Ba Đình": ["Phường Ngọc Hà", "Phường Điện Biên", "Phường Đội Cấn"],
    "Quận Hoàn Kiếm": ["Phường Hàng Đào", "Phường Hàng Bạc", "Phường Hàng Bồ"],
  },
};

const AddressSelector = () => {
  const [selectedCity, setSelectedCity] = useState(""); // Thành phố đã chọn
  const [selectedDistrict, setSelectedDistrict] = useState(""); // Quận/Huyện đã chọn
  const [wards, setWards] = useState([]); // Danh sách phường/xã

  // Xử lý khi chọn Thành phố
  const handleCityChange = (event) => {
    const city = event.target.value;
    setSelectedCity(city);
    setSelectedDistrict(""); // Reset quận/huyện khi thay đổi thành phố
    setWards([]); // Reset phường/xã khi thay đổi thành phố
  };

  // Xử lý khi chọn Quận/Huyện
  const handleDistrictChange = (event) => {
    const district = event.target.value;
    setSelectedDistrict(district);
    setWards(vietnamAddressData[selectedCity][district] || []);
  };

  return (
    <div style={{ maxWidth: "500px", margin: "0 auto", padding: "20px" }}>
      <h2>Chọn địa chỉ</h2>

      {/* Thành phố */}
      <div style={{ marginBottom: "15px" }}>
        <label htmlFor="city" style={{ display: "block", marginBottom: "5px" }}>
          Thành phố:
        </label>
        <select
          id="city"
          value={selectedCity}
          onChange={handleCityChange}
          style={{
            width: "100%",
            padding: "8px",
            fontSize: "16px",
          }}
        >
          <option value="">-- Chọn thành phố --</option>
          {Object.keys(vietnamAddressData).map((city) => (
            <option key={city} value={city}>
              {city}
            </option>
          ))}
        </select>
      </div>

      {/* Quận/Huyện */}
      {selectedCity && (
        <div style={{ marginBottom: "15px" }}>
          <label
            htmlFor="district"
            style={{ display: "block", marginBottom: "5px" }}
          >
            Quận/Huyện:
          </label>
          <select
            id="district"
            value={selectedDistrict}
            onChange={handleDistrictChange}
            style={{
              width: "100%",
              padding: "8px",
              fontSize: "16px",
            }}
          >
            <option value="">-- Chọn quận/huyện --</option>
            {Object.keys(vietnamAddressData[selectedCity]).map((district) => (
              <option key={district} value={district}>
                {district}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Phường/Xã */}
      {selectedDistrict && (
        <div style={{ marginBottom: "15px" }}>
          <label
            htmlFor="ward"
            style={{ display: "block", marginBottom: "5px" }}
          >
            Phường/Xã:
          </label>
          <select
            id="ward"
            style={{
              width: "100%",
              padding: "8px",
              fontSize: "16px",
            }}
          >
            <option value="">-- Chọn phường/xã --</option>
            {wards.map((ward) => (
              <option key={ward} value={ward}>
                {ward}
              </option>
            ))}
          </select>
        </div>
      )}
    </div>
  );
};

export default AddressSelector;
