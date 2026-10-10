import {
  Eye,
  Plus,
  Save,
  Trash2,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { resumeApi } from "../api/index.js";

const tabs = [
  "personal",
  "summary",
  "education",
  "experience",
  "projects",
  "skills",
  "certifications",
];

export default function ResumeBuilder() {
  const [searchParams] = useSearchParams();
  const resumeId = searchParams.get("id");
  const [data, setData] = useState(null);
  const [tab, setTab] = useState("personal");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const navigate = useNavigate();

  useEffect(() => {
    async function fetchResume() {
      if (!resumeId) {
        setError("No resume ID provided.");
        setLoading(false);
        return;
      }

      try {
        const versionsData = await resumeApi.getVersions(resumeId);
        if (versionsData.versions.length > 0) {
          const latest = versionsData.versions[0].content;
          setData(latest);
        } else {
          setError("No versions found. Please generate an improved resume first.");
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchResume();
  }, [resumeId]);

  async function handleSave() {
    if (!resumeId) return;
    setSaving(true);
    setError("");

    try {
      // We find the latest version ID to update it, or create a new one.
      // For simplicity, we'll update the most recent one.
      const versionsData = await resumeApi.getVersions(resumeId);
      const latestVersionId = versionsData.versions[0].id;

      await resumeApi.updateVersion(resumeId, latestVersionId, data);
      navigate("/improved");
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  function update(section, key, value, index) {
    setData((prev) => {
      const next = { ...prev };

      if (index !== undefined) {
        next[section] = prev[section].map((item, i) =>
          i === index
            ? { ...item, [key]: value }
            : item
        );
      } else {
        next[section] = key
          ? { ...prev[section], [key]: value }
          : value;
      }

      return next;
    });
  }

  function add(section) {
    const templates = {
      education: {
        school: "",
        degree: "",
        year: "",
        gpa: "",
      },

      experience: {
        company: "",
        role: "",
        duration: "",
        bullets: [""],
      },

      projects: {
        name: "",
        description: "",
        link: "",
      },

      certifications: "",
    };

    setData((prev) => ({
      ...prev,
      [section]: Array.isArray(prev[section])
        ? [...prev[section], templates[section]]
        : [templates[section]],
    }));
  }

  function remove(section, index) {
    setData((prev) => ({
      ...prev,
      [section]: prev[section].filter(
        (_, i) => i !== index
      ),
    }));
  }

  function updateBullet(
    experienceIndex,
    bulletIndex,
    value
  ) {
    setData((prev) => {
      const experience = [...prev.experience];

      const bullets = [
        ...experience[experienceIndex].bullets,
      ];

      if (value === null) {
        bullets.splice(bulletIndex, 1);
      } else {
        bullets[bulletIndex] = value;
      }

      experience[experienceIndex] = {
        ...experience[experienceIndex],
        bullets,
      };

      return {
        ...prev,
        experience,
      };
    });
  }

  if (loading) {
    return (
      <div className="dashboard-page">
        <div className="loading-state">Loading builder...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard-page">
        <div className="error-state">{error}</div>
      </div>
    );
  }

  return (
    <>
      <div className="page-heading">
        <div>
          <span className="page-eyebrow">RESUME BUILDER</span>
          <h1>Build your resume</h1>
          <p>
            Edit your content while watching the final resume update live.
          </p>
        </div>

        <button
          className="primary-button"
          onClick={handleSave}
          disabled={saving}
        >
          <Save size={16} />
          {saving ? "Saving..." : "Save and Preview"}
        </button>
      </div>

      <div className="builder-layout">
        <section className="content-card builder-editor">
          <div className="builder-tabs">
            {tabs.map((item) => (
              <button
                key={item}
                className={
                  tab === item
                    ? "builder-tab active"
                    : "builder-tab"
                }
                onClick={() => setTab(item)}
              >
                {item}
              </button>
            ))}
          </div>

          <BuilderEditor
            tab={tab}
            data={data}
            update={update}
            add={add}
            remove={remove}
            updateBullet={updateBullet}
          />
        </section>

        <section className="content-card preview-card">
          <div className="preview-header">
            <span>
              <Eye size={14} />
              Live preview
            </span>

            <span>ATS-friendly</span>
          </div>

          <ResumePreview data={data} />
        </section>
      </div>
    </>
  );
}

function BuilderEditor({
  tab,
  data,
  update,
  add,
  remove,
  updateBullet,
}) {
  if (tab === "personal") {
    return (
      <div className="editor-grid">
        <Field
          label="Full name"
          value={data.personal.name}
          onChange={(e) =>
            update("personal", "name", e.target.value)
          }
        />

        <Field
          label="Email"
          value={data.personal.email}
          onChange={(e) =>
            update("personal", "email", e.target.value)
          }
        />

        <Field
          label="Phone"
          value={data.personal.phone}
          onChange={(e) =>
            update("personal", "phone", e.target.value)
          }
        />

        <Field
          label="Location"
          value={data.personal.location}
          onChange={(e) =>
            update(
              "personal",
              "location",
              e.target.value
            )
          }
        />

        <Field
          label="LinkedIn"
          value={data.personal.linkedin}
          onChange={(e) =>
            update(
              "personal",
              "linkedin",
              e.target.value
            )
          }
        />

        <Field
          label="GitHub"
          value={data.personal.github}
          onChange={(e) =>
            update(
              "personal",
              "github",
              e.target.value
            )
          }
        />
      </div>
    );
  }

  if (tab === "summary") {
    return (
      <Field
        label="Professional summary"
        textarea
        value={data.summary}
        onChange={(e) =>
          update("summary", null, e.target.value)
        }
      />
    );
  }

  if (tab === "skills") {
    return (
      <Field
        label="Skills · comma separated"
        textarea
        value={Array.isArray(data.skills) ? data.skills.join(", ") : ""}
        onChange={(e) =>
          update(
            "skills",
            null,
            e.target.value
              .split(",")
              .map((x) => x.trim())
              .filter(Boolean)
          )
        }
      />
    );
  }

  if (tab === "certifications") {
    return (
      <div className="editor-stack">
        {(Array.isArray(data.certifications) ? data.certifications : []).map((cert, index) => (
          <div className="editor-row" key={index}>
            <input
              className="form-input"
              value={cert}
              onChange={(e) =>
                update(
                  "certifications",
                  null,
                  data.certifications.map(
                    (item, i) =>
                      i === index
                        ? e.target.value
                        : item
                  )
                )
              }
            />

            <button
              className="delete-button"
              onClick={() =>
                remove("certifications", index)
              }
            >
              <Trash2 size={15} />
            </button>
          </div>
        ))}

        <button
          className="secondary-button"
          onClick={() => add("certifications")}
        >
          <Plus size={15} />
          Add certification
        </button>
      </div>
    );
  }

  return (
    <div className="editor-stack">
      {(Array.isArray(data[tab]) ? data[tab] : []).map((item, index) => (
        <div className="editor-entry" key={index}>
          <div className="entry-title">
            <strong>
              {tab.slice(0, -1).toUpperCase()} {index + 1}
            </strong>

            <button
              className="delete-button"
              onClick={() => remove(tab, index)}
            >
              <Trash2 size={15} />
            </button>
          </div>

          {tab === "education" && (
            <div className="editor-grid">
              <Field
                label="School"
                value={item.school}
                onChange={(e) =>
                  update(
                    tab,
                    "school",
                    e.target.value,
                    index
                  )
                }
              />

              <Field
                label="Degree"
                value={item.degree}
                onChange={(e) =>
                  update(
                    tab,
                    "degree",
                    e.target.value,
                    index
                  )
                }
              />

              <Field
                label="Year"
                value={item.year}
                onChange={(e) =>
                  update(
                    tab,
                    "year",
                    e.target.value,
                    index
                  )
                }
              />

              <Field
                label="GPA"
                value={item.gpa}
                onChange={(e) =>
                  update(
                    tab,
                    "gpa",
                    e.target.value,
                    index
                  )
                }
              />
            </div>
          )}

          {tab === "experience" && (
            <div className="editor-grid">
              <Field
                label="Company"
                value={item.company}
                onChange={(e) =>
                  update(
                    tab,
                    "company",
                    e.target.value,
                    index
                  )
                }
              />

              <Field
                label="Role"
                value={item.role}
                onChange={(e) =>
                  update(
                    tab,
                    "role",
                    e.target.value,
                    index
                  )
                }
              />

              <Field
                label="Duration"
                value={item.duration}
                onChange={(e) =>
                  update(
                    tab,
                    "duration",
                    e.target.value,
                    index
                  )
                }
              />

              <div className="full-field">
                <label>Bullet points</label>

                {item.bullets.map((bullet, bulletIndex) => (
                  <div
                    className="bullet-editor"
                    key={bulletIndex}
                  >
                    <input
                      className="form-input"
                      value={bullet}
                      onChange={(e) =>
                        updateBullet(
                          index,
                          bulletIndex,
                          e.target.value
                        )
                      }
                    />

                    <button
                      className="delete-button"
                      onClick={() =>
                        updateBullet(
                          index,
                          bulletIndex,
                          null
                        )
                      }
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}

                <button
                  className="secondary-button small"
                  onClick={() =>
                    updateBullet(
                      index,
                      item.bullets.length,
                      ""
                    )
                  }
                >
                  <Plus size={14} />
                  Add bullet
                </button>
              </div>
            </div>
          )}

          {tab === "projects" && (
            <div className="editor-grid">
              <div className="full-field">
                <Field
                  label="Project name"
                  value={item.name}
                  onChange={(e) =>
                    update(
                      tab,
                      "name",
                      e.target.value,
                      index
                    )
                  }
                />
              </div>

              <div className="full-field">
                <Field
                  label="Description"
                  textarea
                  value={item.description}
                  onChange={(e) =>
                    update(
                      tab,
                      "description",
                      e.target.value,
                      index
                    )
                  }
                />
              </div>

              <div className="full-field">
                <Field
                  label="Link"
                  value={item.link}
                  onChange={(e) =>
                    update(
                      tab,
                      "link",
                      e.target.value,
                      index
                    )
                  }
                />
              </div>
            </div>
          )}
        </div>
      ))}

      <button
        className="secondary-button"
        onClick={() => add(tab)}
      >
        <Plus size={15} />
        Add {tab.slice(0, -1)}
      </button>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  textarea = false,
}) {
  return (
    <div className="form-field">
      <label>{label}</label>

      {textarea ? (
        <textarea
          className="form-textarea"
          value={value}
          onChange={onChange}
        />
      ) : (
        <input
          className="form-input"
          value={value}
          onChange={onChange}
        />
      )}
    </div>
  );
}

function ResumePreview({ data }) {
  if (!data) return null;

  return (
    <article className="resume-document">
      <header className="resume-header">
        <h1>{data.personal.name}</h1>

        <p>
          {data.personal.email} · {data.personal.phone} ·{" "}
          {data.personal.location}
        </p>

        <p>
          {data.personal.linkedin} · {data.personal.github}
        </p>
      </header>

      <ResumeSection title="Professional Summary">
        <p>{data.summary}</p>
      </ResumeSection>

      <ResumeSection title="Education">
        {(data.education || []).map((item, index) => (
          <div className="resume-item" key={index}>
            <div className="resume-item-top">
              <strong>{item.school}</strong>
              <span>{item.year}</span>
            </div>

            <p>
              {item.degree} · GPA {item.gpa}
            </p>
          </div>
        ))}
      </ResumeSection>

      <ResumeSection title="Experience">
        {(data.experience || []).map((item, index) => (
          <div className="resume-item" key={index}>
            <div className="resume-item-top">
              <strong>
                {item.company} · {item.role}
              </strong>

              <span>{item.duration}</span>
            </div>

            <ul>
              {item.bullets.map((bullet, i) => (
                <li key={i}>{bullet}</li>
              ))}
            </ul>
          </div>
        ))}
      </ResumeSection>

      <ResumeSection title="Projects">
        {(data.projects || []).map((item, index) => (
          <div className="resume-item" key={index}>
            <strong>{item.name}</strong>
            <p>{item.description}</p>
            <small>{item.link}</small>
          </div>
        ))}
      </ResumeSection>

      <ResumeSection title="Skills">
        <p>{Array.isArray(data.skills) ? data.skills.join(" · ") : data.skills}</p>
      </ResumeSection>

      <ResumeSection title="Certifications">
        <p>{Array.isArray(data.certifications) ? data.certifications.join(" · ") : data.certifications}</p>
      </ResumeSection>
    </article>
  );
}

function ResumeSection({ title, children }) {
  return (
    <section className="resume-section">
      <h2>{title}</h2>
      {children}
    </section>
  );
}
