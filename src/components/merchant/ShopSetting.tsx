import {
  PhoneIcon,
  PlusIcon,
  TrashIcon,
  XCircleIcon,
} from "@heroicons/react/24/outline";
import { useFormik } from "formik";
import Image from "next/image";
import Link from "next/link";
import { ShopContact, ShopGeneral } from "../../common/models";
import { getShopBySlug } from "../../services/ShopService";
import { Input, TagInput, Textarea } from "../forms";
import Tabs from "../Tabs";

const list = [1, 2, 3, 4];

interface ShopGeneralUpdateProps {
  value: ShopGeneral;
}

interface ShopContactUpdateProps {
  value: ShopContact;
}

const General = ({ value }: ShopGeneralUpdateProps) => {
  const formik = useFormik<ShopGeneral>({
    initialValues: value,
    validate: async (values) => {
      /* const errors: ShopGeneral = {};

      if (!values.name || values.name.trim().length === 0) {
        errors.name = "Please enter shop name";
      }

      if (!values.slug || values.slug.trim().length === 0) {
        errors.slug = "Please enter shop slug";
      } else {
        try {
          const shop = await getShopBySlug(values.slug);
          if (shop.id !== values.id && shop.slug === values.slug) {
            errors.slug = "Shop slug already in use";
          }
        } catch (error: any) {
          if (error?.status !== 404) {
            errors.slug = "Error checking, please try again";
          }
        }
      }

      return errors; */
    },
    validateOnBlur: false,
    validateOnChange: false,
    onSubmit: (values) => {
      save(values);
    },
  });

  const save = (values: ShopContact) => {
    console.log(values);
  };

  return (
    <form onSubmit={formik.handleSubmit}>
      <div className="card">
        <div className="card-body">
          <div className="row g-3 mb-3">
            <div className="col-lg-6">
              <Input
                label="Name *"
                id="shopNameInput"
                name="name"
                type="text"
                placeholder="Enter shop name"
                value={formik.values.name}
                onChange={(evt) => {
                  const slug = evt.target.value
                    .replace(/\s+/g, "-")
                    .toLowerCase();
                  formik.setFieldValue("slug", slug);
                  formik.handleChange(evt);
                }}
                /* error={formik.errors.name} */
              />
            </div>
            <div className="col-lg-6">
              <Input
                label="Slug *"
                id="slugInput"
                name="slug"
                type="text"
                placeholder="https://shoppingcenter.com/page/slug"
                value={formik.values.slug}
                onChange={formik.handleChange}
                /* error={formik.errors.slug} */
              />
            </div>
          </div>
          <div className="row g-3 mb-3">
            <div className="order-5 order-lg-3 order-md-5 col-lg-6">
              <label className="form-label">About us</label>
              <Textarea
                id="aboutUsInput"
                placeholder="Enter about shop"
                height={200}
                value={formik.values.about!}
                onChange={formik.handleChange}
              />
            </div>
            <div className="order-3 order-lg-4 order-md-3 order-1 col-lg-6">
              <Input
                label="Headline"
                id="headlineInput"
                name="headline"
                type="text"
                className="mb-3"
                placeholder="Enter shop headline"
                value={formik.values.headline!}
                onChange={formik.handleChange}
              />
            </div>
          </div>
        </div>
        <div className="card-footer py-2h">
          <div className="clearfix">
            <button type="submit" className="float-end btn btn-primary">
              Save
            </button>
          </div>
        </div>
      </div>
    </form>
  );
};

const Contact = ({ value }: ShopContactUpdateProps) => {
  const formik = useFormik<ShopContact>({
    initialValues: value,
    validateOnChange: false,
    validateOnBlur: false,
    onSubmit: (values) => {
      save(values);
    },
  });

  const save = (values: ShopContact) => {
    console.log(values);
  };

  return (
    <form onSubmit={formik.handleSubmit}>
      <div className="card">
        <div className="card-body">
          <div className="mb-3">
            <label className="form-label">Phones</label>
            <TagInput data={[]} placeholder="Add phone" />
          </div>

          <div className="mb-3">
            <Input
              label="Address"
              name="address"
              placeholder="Enter shop address"
              value={formik.values.address!}
              onChange={formik.handleChange}
            />
          </div>
          <div>
            <label className="form-label">Location</label>
            <div className="row g-3">
              <div className="col-md-6">
                <Input
                  name="latitude"
                  placeholder="Enter latitude"
                  value={formik.values.latitude!}
                  onChange={formik.handleChange}
                />
              </div>
              <div className="col-md-6">
                <Input
                  name="longitude"
                  placeholder="Enter longitude"
                  value={formik.values.longitude!}
                  onChange={formik.handleChange}
                />
              </div>
            </div>
          </div>
        </div>
        <div className="card-footer py-2h">
          <div className="clearfix">
            <button type="submit" className="btn btn-primary float-end">
              Save
            </button>
          </div>
        </div>
        {/* <div className="d-flex justify-content-start">
        <Link href="#">
          <a className="btn btn-primary">
            <div className="hstack">
              <PlusIcon className="me-2" width={20} />
              Add new
            </div>
          </a>
        </Link>
      </div>
      <div className="d-flex flex-wrap gap-3 py-3">
        {list.map((i) => (
          <div className="hstack bg-light rounded p-2" key={i}>
            <PhoneIcon width={15} className="flex-shrink-0" />
            <span className="text-dark ms-1 small">09-24442122</span>
            <div role="button" className="link-danger ms-2">
              <XCircleIcon className="flex-shrink-0" width={20} />
            </div>
          </div>
        ))}
      </div> */}
      </div>
    </form>
  );
};

const Branches = () => {
  return (
    <div className="p-3">
      <div className="mb-3">
        <Link href="#">
          <a className="btn btn-primary">
            <div className="hstack">
              <PlusIcon className="me-2" width={20} />
              Add new
            </div>
          </a>
        </Link>
      </div>

      <div className="row row-cols-1 row-cols-sm-2 row-cols-lg-2 g-3">
        {list.map((i) => (
          <div className="col" key={i}>
            <div className="bg-light rounded p-3">
              <div className="vstack">
                <div className="hstack align-items-start">
                  <div className="vstack">
                    <h6 className="flex-grow-1 pe-2 mb-1">
                      Global Stationary Shop
                    </h6>
                    <div className="hstack mb-3">
                      <PhoneIcon className="me-2" width={14} />
                      <small className="text-muted">09121219987</small>
                    </div>
                  </div>

                  <a className="btn btn-outline-danger px-2">
                    <TrashIcon className="p-0" width={16} strokeWidth={1.5} />
                  </a>
                </div>
                <div className="text-muted small">
                  Yangon city, Pyay Road, Building 123, House 321
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const Social = () => {
  return (
    <div className="py-1">
      <div className="d-flex justify-content-start">
        <Link href="#">
          <a className="btn btn-primary">
            <div className="hstack">
              <PlusIcon className="me-2" width={20} />
              Add new
            </div>
          </a>
        </Link>
      </div>
      <div className="d-flex flex-wrap gap-3 py-3">
        {list.map((i) => (
          <div className="hstack bg-light rounded p-2" key={i}>
            <Image
              className="flex-shrink-0"
              src="/images/icons8-facebook-48.png"
              alt="facebook"
              width={28}
              height={28}
            />
            <span className="text-dark ms-1 small">Shopping Center</span>
            <div role="button" className="link-danger ms-2">
              <XCircleIcon className="flex-shrink-0" width={20} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

function ShopSetting() {
  const general: ShopGeneral = {
    id: 0
  };
  const contact: ShopContact = {
    id: 0
  };
  return (
    <div>
      <div className="bg-white rounded h-100 shadow-sm">
        <Tabs defaultTabKey="general">
          <Tabs.Tab tabKey="general" title="General">
            <General value={general}/>
          </Tabs.Tab>
          <Tabs.Tab tabKey="contact" title="Contact">
            <Contact value={contact} />
          </Tabs.Tab>
          <Tabs.Tab tabKey="branches" title="Branches">
            <Branches />
          </Tabs.Tab>
        </Tabs>
      </div>
    </div>
  );
}

export default ShopSetting;
