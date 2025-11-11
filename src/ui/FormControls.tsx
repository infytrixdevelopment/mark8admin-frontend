import React, { type Dispatch, type MutableRefObject, type SetStateAction } from 'react'
import { TEXT_PRIMARY } from '../constants/textColorsConstants';
import "../index.css";

type Brand = {
    id: string;
    name: string;
    categoryHierarchyLevel?: number;
}

type DropdownProps = {
    brands: Brand[];
    setOpenDropdown: Dispatch<SetStateAction<boolean>>;
    selBrand: Brand;
    onBrandChangeHandler: (ag_brandObj: Brand) => void;
    dropdownRef: MutableRefObject<HTMLDivElement | null>;
}

const DropdownCmp:React.FC<DropdownProps> = ({brands, setOpenDropdown, selBrand, onBrandChangeHandler, dropdownRef}) => {
  return (
    <div style={{
        position: "absolute",
        top: 34,
        left: 0,
        width: "100%",
        maxHeight: "256px",
        overflow: "auto",
        padding: "8px 0px",
        backgroundColor: TEXT_PRIMARY.WHITE,
        borderRadius: "8px",
        boxShadow: "0px 4px 10px 4px rgba(28, 28, 28, 0.05)"
        }}
        ref={dropdownRef}
        >
        {brands?.map((brand: Brand) => {
            return (
            <div
                style={{
                    display: "flex",
                    height: "40px",
                    padding: "12px",
                    alignItems: "center",
                    gap: "8px",
                    alignSelf: "stretch",
                }}
                className="dropdownElement"
                key={brand?.id}
                onClick={()=>{ 
                    onBrandChangeHandler(brand);
                    setOpenDropdown(false);
                }}
                >
                <div
                    style={{
                        color: selBrand?.id === brand?.id ? TEXT_PRIMARY.PURPLE :  TEXT_PRIMARY.GREY,
                        fontSize: "12px",
                        fontStyle: "normal",
                        fontWeight: selBrand?.id === brand?.id ? 600 : 400,
                        lineHeight: "16px",
                    }}
                    >
                    {brand?.name}
                </div>
            </div>
        )})}
    </div>
    )
}

type Country = {
    id: string;
    name: string;
}

type Dropdown2Props = {
    countries: Country[];
    setOpenDropdown: Dispatch<SetStateAction<boolean>>;
    selCountry: Country;
    onCountryChangeHandler: (countryObj:Country) => void;
    dropdownRef: MutableRefObject<HTMLDivElement | null>;
}

const DropdownCmp2:React.FC<Dropdown2Props> = ({countries, setOpenDropdown,selCountry, onCountryChangeHandler, dropdownRef}) => {
    return (
      <div style={{
          position: "absolute",
          top: 34,
          left: 0,
          width: "100%",
          maxHeight: "256px",
          overflow: "auto",
          padding: "8px 0px",
          backgroundColor: TEXT_PRIMARY.WHITE,
          borderRadius: "8px",
          boxShadow: "0px 4px 10px 4px rgba(28, 28, 28, 0.05)"
          }}
          ref={dropdownRef}
          >
          {countries?.map((c: Country) => {
              return (
              <div
                  style={{
                      display: "flex",
                      height: "40px",
                      padding: "12px",
                      alignItems: "center",
                      gap: "8px",
                      alignSelf: "stretch",
                  }}
                  className="dropdownElement"
                  key={c?.id}
                  onClick={()=>{ 
                      onCountryChangeHandler(c);
                      setOpenDropdown(false);
                  }}
                  >
                    <div style={{
                        display: "flex",
                        gap: "8px",
                        alignItems: "center"
                    }}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="30" height="20" viewBox="0 0 30 20" fill="none">
                            <g clip-path="url(#clip0_1464_4658)">
                                <path d="M1.01172 0H28.9883V20H1.01172V0Z" fill="#181A93"/>
                                <path d="M0 0H30V6.66667H0V0Z" fill="#FFA44A"/>
                                <path d="M0 13.3333H30V20H0V13.3333Z" fill="#1A9F0B"/>
                                <path d="M0 6.66669H30V13.3334H0V6.66669Z" fill="white"/>
                                <path d="M15 12C16.1046 12 17 11.1046 17 10C17 8.89543 16.1046 8 15 8C13.8954 8 13 8.89543 13 10C13 11.1046 13.8954 12 15 12Z" fill="white"/>
                                <path d="M15.0002 12.6666C13.5323 12.6666 12.3335 11.4678 12.3335 9.99998C12.3335 8.53214 13.5323 7.33331 15.0002 7.33331C16.468 7.33331 17.6668 8.53214 17.6668 9.99998C17.6668 11.4678 16.468 12.6666 15.0002 12.6666ZM15.0002 12C16.0645 12 17.0002 11.0643 17.0002 9.99998C17.0002 8.93565 16.0703 7.99998 15.0002 7.99998C13.93 7.99998 13.0002 8.93565 13.0002 9.99998C13.0002 11.0643 13.9358 12 15.0002 12Z" fill="#181A93"/>
                                <path d="M14.9998 11.3334C15.7362 11.3334 16.3332 10.7364 16.3332 10C16.3332 9.26364 15.7362 8.66669 14.9998 8.66669C14.2635 8.66669 13.6665 9.26364 13.6665 10C13.6665 10.7364 14.2635 11.3334 14.9998 11.3334Z" fill="#181A93"/>
                            </g>
                            <defs>
                                <clipPath id="clip0_1464_4658">
                                <rect width="30" height="20" fill="white"/>
                                </clipPath>
                            </defs>
                        </svg>

                        <div
                            style={{
                                color: selCountry?.id === c?.id ? TEXT_PRIMARY.PURPLE :  TEXT_PRIMARY.GREY,
                                fontSize: "12px",
                                fontStyle: "normal",
                                fontWeight:selCountry?.id === c?.id ? 600 : 400,
                                lineHeight: "16px",
                                textTransform: "uppercase"
                            }}
                            >
                            {c?.name}
                        </div>
                    </div>
              </div>
          )})}
      </div>
      )
  }

export {DropdownCmp, DropdownCmp2}