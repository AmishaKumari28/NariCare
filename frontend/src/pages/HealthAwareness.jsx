
import { useEffect, useState } from "react";

import {
  BookOpen,
  Search,
  Heart,
  CalendarDays,
  Activity,
  ShieldCheck,
  AlertCircle,
  ArrowRight,
  X,
  Sparkles,
  HeartPulse,
  ExternalLink,
} from "lucide-react";

import "./HealthAwareness.css";

const articles = [
  {
    id: 1,
    title: "Understanding Your Menstrual Cycle",
    category: "Menstrual Health",
    icon: CalendarDays,
    color: "pink",
    description:
      "Learn about the different phases of the menstrual cycle and why cycle lengths may vary.",
    content:
      "The menstrual cycle begins on the first day of menstrual bleeding. Cycle length varies between individuals and can change over time. Tracking period start dates can help you understand your personal patterns. The menstrual cycle is regulated by hormones and includes changes in the ovaries and uterus.",
    source:
      "https://womenshealth.gov/menstrual-cycle/your-menstrual-cycle",
  },
  {
    id: 2,
    title: "Managing Period Cramps",
    category: "Self-Care",
    icon: Heart,
    color: "mint",
    description:
      "Explore common comfort measures for menstrual cramps.",
    content:
      "A warm heating pad, gentle physical activity, and adequate rest may help relieve mild menstrual discomfort. Some people also benefit from over-the-counter pain relief when medically appropriate. Severe pain that interferes with daily activities should be discussed with a healthcare professional.",
    source:
      "https://www.nhs.uk/conditions/period-pain/",
  },
  {
    id: 3,
    title: "Understanding PMS Symptoms",
    category: "Menstrual Health",
    icon: Activity,
    color: "lavender",
    description:
      "Learn about common physical and emotional changes before a period.",
    content:
      "Premenstrual syndrome (PMS) can involve bloating, headaches, fatigue, breast tenderness, irritability, and mood changes. Symptoms vary from person to person and may change between cycles. Keeping a symptom diary can help identify recurring patterns.",
    source:
      "https://www.nhs.uk/conditions/pre-menstrual-syndrome/",
  },
  {
    id: 4,
    title: "Why Symptom Tracking Matters",
    category: "Health Tracking",
    icon: BookOpen,
    color: "blue",
    description:
      "Discover how maintaining a symptom history can support medical conversations.",
    content:
      "Recording symptom dates, severity, and notes can make it easier to explain changes over time to a healthcare professional. You can track pain, fatigue, mood changes, headaches, and other symptoms. Symptom tracking can help identify patterns, but it cannot diagnose a medical condition.",
    source:
      "https://womenshealth.gov/menstrual-cycle/your-menstrual-cycle",
  },
  {
    id: 5,
    title: "When to Seek Medical Advice",
    category: "Health & Safety",
    icon: AlertCircle,
    color: "peach",
    description:
      "Recognize menstrual symptoms that deserve medical attention.",
    content:
      "Seek medical advice for persistent severe pain, unusually heavy bleeding, bleeding between periods, or major changes in your usual cycle. Seek urgent medical care for fainting, severe sudden pelvic pain, or heavy bleeding accompanied by significant weakness.",
    source:
      "https://www.nhs.uk/conditions/heavy-periods/",
  },
  {
    id: 6,
    title: "Protecting Your Health Information",
    category: "Health & Safety",
    icon: ShieldCheck,
    color: "lavender",
    description:
      "Understand why personal health information should be handled carefully.",
    content:
      "Health records may contain sensitive personal details. Use trusted devices, strong passwords, and secure connections. Avoid sharing personal medical reports publicly, and review information carefully before sending it to anyone.",
    source:
      "https://www.hhs.gov/hipaa/for-individuals/index.html",
  },
  {
    id: 7,
    title: "Understanding PCOS",
    category: "PCOS Awareness",
    icon: Activity,
    color: "lavender",
    description:
      "Learn about PCOS, its common symptoms, and when to seek medical advice.",
    content:
      "Polycystic ovary syndrome (PCOS) is a hormonal condition. Possible symptoms include irregular periods, acne, increased facial or body hair, and difficulty becoming pregnant. Symptoms vary between individuals. Diagnosis requires assessment by a healthcare professional, who may consider medical history, symptoms, blood tests, and ultrasound findings.",
    source:
      "https://www.nhs.uk/conditions/polycystic-ovary-syndrome-pcos/",
  },
  {
    id: 8,
    title: "Menstrual Hygiene Tips",
    category: "Period Hygiene",
    icon: ShieldCheck,
    color: "mint",
    description:
      "Simple habits for managing periods safely and comfortably.",
    content:
      "Wash your hands before and after changing menstrual products. Change pads regularly and tampons every 4 to 8 hours, following product instructions. Wash the external genital area gently and avoid scented products that may cause irritation. Dispose of used menstrual products appropriately.",
    source:
      "https://www.cdc.gov/hygiene/about/menstrual-hygiene.html",
  },
  {
    id: 9,
    title: "Why Are My Periods Irregular?",
    category: "Menstrual Health",
    icon: CalendarDays,
    color: "pink",
    description:
      "Understand common reasons why menstrual cycle timing can change.",
    content:
      "Periods may become irregular because of stress, changes in weight, intense exercise, pregnancy, hormonal contraception, or medical conditions such as PCOS and thyroid disorders. Some variation is common. Speak with a healthcare professional if your usual cycle pattern changes significantly or irregularity persists.",
    source:
      "https://www.nhs.uk/symptoms/irregular-periods/",
  },
  {
    id: 10,
    title: "Heavy Period Bleeding",
    category: "When to See a Doctor",
    icon: AlertCircle,
    color: "peach",
    description:
      "Recognize signs of unusually heavy menstrual bleeding.",
    content:
      "Bleeding lasting more than seven days, needing to change menstrual products very frequently, or passing large blood clots may indicate heavy menstrual bleeding. Consult a healthcare professional if your bleeding is unusually heavy or affecting your daily life. Seek urgent medical care if heavy bleeding is accompanied by fainting or severe weakness.",
    source:
      "https://www.nhs.uk/conditions/heavy-periods/",
  },
  {
    id: 11,
    title: "Period Pain and Cramps",
    category: "Common Symptoms",
    icon: Heart,
    color: "pink",
    description:
      "Understand period cramps and ways to ease mild discomfort.",
    content:
      "Period cramps are often caused by contractions of the uterus. A heating pad, warm bath, gentle exercise, and adequate rest may help ease mild discomfort. Pain that is severe, worsening, or preventing normal activities should be assessed by a healthcare professional.",
    source:
      "https://www.nhs.uk/conditions/period-pain/",
  },
  {
    id: 12,
    title: "When Should You See a Doctor?",
    category: "When to See a Doctor",
    icon: HeartPulse,
    color: "blue",
    description:
      "Know when menstrual symptoms need professional assessment.",
    content:
      "Speak with a healthcare professional if your periods suddenly become irregular, your bleeding is unusually heavy, you bleed between periods, or menstrual pain interferes with everyday life. Seek urgent medical attention for severe sudden pelvic pain, fainting, or heavy bleeding with significant weakness.",
    source:
      "https://www.nhs.uk/conditions/periods/",
  },
];

const categories = [
  "All",
  "Menstrual Health",
  "Period Hygiene",
  "PCOS Awareness",
  "Common Symptoms",
  "When to See a Doctor",
  "Self-Care",
  "Health Tracking",
  "Health & Safety",
];

export default function HealthAwareness() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [selectedArticle, setSelectedArticle] = useState(null);

  const filteredArticles = articles.filter((article) => {
    const matchesCategory =
      category === "All" || article.category === category;

    const query = search.trim().toLowerCase();

    const matchesSearch =
      article.title.toLowerCase().includes(query) ||
      article.category.toLowerCase().includes(query) ||
      article.description.toLowerCase().includes(query) ||
      article.content.toLowerCase().includes(query);

    return matchesCategory && matchesSearch;
  });

  useEffect(() => {
    if (!selectedArticle) return;

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        setSelectedArticle(null);
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [selectedArticle]);

  const clearFilters = () => {
    setSearch("");
    setCategory("All");
  };

  return (
    <div className="sakhi-awareness-page">
      {/* PAGE HEADER */}
      <div className="sakhi-awareness-header">
        <div>
          <h1>Health Awareness 💜</h1>

          <p>
            Explore helpful information about menstrual
            health, symptom tracking, and self-care.
          </p>
        </div>

        <div className="sakhi-awareness-header-icon">
          <HeartPulse size={23} />
        </div>
      </div>

      {/* SEARCH BAR */}
      <div className="sakhi-awareness-search">
        <Search size={19} />

        <input
          type="search"
          placeholder="Search health topics, PCOS, period pain..."
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          aria-label="Search health topics"
        />
      </div>

      {/* CATEGORY FILTERS */}
      <div className="sakhi-awareness-filters">
        {categories.map((item) => (
          <button
            key={item}
            type="button"
            className={`sakhi-awareness-filter ${
              category === item ? "active" : ""
            }`}
            onClick={() => setCategory(item)}
            aria-pressed={category === item}
          >
            {item}
          </button>
        ))}
      </div>

      {/* SECTION HEADING */}
      <div className="sakhi-awareness-section-heading">
        <div>
          <h2>Explore Health Topics</h2>
          <p>
            Helpful information for your wellness journey
          </p>
        </div>

        <span>
          {filteredArticles.length}{" "}
          {filteredArticles.length === 1
            ? "article"
            : "articles"}
        </span>
      </div>

      {/* ARTICLE CARDS */}
      {filteredArticles.length === 0 ? (
        <div className="sakhi-awareness-empty">
          <Search size={30} />

          <h3>No matching topics found</h3>

          <p>
            Try another search or choose a different
            category.
          </p>

          <button
            type="button"
            className="sakhi-awareness-clear"
            onClick={clearFilters}
          >
            Show All Articles
          </button>
        </div>
      ) : (
        <div className="sakhi-awareness-grid">
          {filteredArticles.map((article) => {
            const Icon = article.icon;

            return (
              <article
                className="sakhi-awareness-card"
                key={article.id}
              >
                <div
                  className={`sakhi-awareness-card-art ${article.color}`}
                >
                  <div className="sakhi-awareness-art-circle">
                    <Icon size={36} strokeWidth={1.7} />
                  </div>

                  <Sparkles
                    className="sakhi-awareness-art-sparkle"
                    size={20}
                  />
                </div>

                <div className="sakhi-awareness-card-content">
                  <span
                    className={`sakhi-awareness-category ${article.color}`}
                  >
                    {article.category}
                  </span>

                  <h3>{article.title}</h3>

                  <p>{article.description}</p>

                  <button
                    type="button"
                    className="sakhi-awareness-read-more"
                    onClick={() => setSelectedArticle(article)}
                  >
                    Read More
                    <ArrowRight size={15} />
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      )}

      {/* HEALTH NOTICE */}
      <div className="sakhi-awareness-notice">
        <div className="sakhi-awareness-notice-icon">
          <ShieldCheck size={22} />
        </div>

        <p>
          <strong>Health Information Notice:</strong>{" "}
          This content is for general education only.
          It does not replace professional medical advice,
          diagnosis, or treatment.
        </p>
      </div>

      {/* ARTICLE POPUP */}
      {selectedArticle && (
        <div
          className="sakhi-awareness-overlay"
          onClick={() => setSelectedArticle(null)}
        >
          <div
            className="sakhi-awareness-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="sakhi-article-title"
            onClick={(event) => event.stopPropagation()}
          >
            <button
              type="button"
              className="sakhi-awareness-close"
              onClick={() => setSelectedArticle(null)}
              aria-label="Close article"
            >
              <X size={20} />
            </button>

            <span
              className={`sakhi-awareness-category ${selectedArticle.color}`}
            >
              {selectedArticle.category}
            </span>

            <h2 id="sakhi-article-title">
              {selectedArticle.title}
            </h2>

            <p className="sakhi-awareness-modal-content">
              {selectedArticle.content}
            </p>

            {selectedArticle.source && (
              <p className="sakhi-awareness-source">
                Source:{" "}
                <a
                  href={selectedArticle.source}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Read original health guidance
                  <ExternalLink size={13} />
                </a>
              </p>
            )}

            <div className="sakhi-awareness-modal-notice">
              <AlertCircle size={17} />

              <span>
                This article is for general health
                education and is not a medical diagnosis.
              </span>
            </div>

            <button
              type="button"
              className="sakhi-awareness-modal-button"
              onClick={() => setSelectedArticle(null)}
            >
              Close Article
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
