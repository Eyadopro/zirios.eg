import { StaticPage } from "../../components/ui/StaticPage";

export default function Page() {
  return <StaticPage title="Size Guide" html={"<h2>Men's Tops</h2><table class=\"w-full text-sm\"><tr class=\"border-b border-white/10\"><th class=\"py-2 pr-4\">Size</th><th class=\"py-2 pr-4\">Chest</th><th class=\"py-2\">Waist</th></tr><tr><td>S</td><td>91-96</td><td>76-81</td></tr><tr><td>M</td><td>97-102</td><td>82-87</td></tr><tr><td>L</td><td>103-108</td><td>88-93</td></tr><tr><td>XL</td><td>109-114</td><td>94-99</td></tr></table><h2>Women's Tops</h2><table class=\"w-full text-sm\"><tr><th>Size</th><th>Bust</th><th>Waist</th></tr><tr><td>XS</td><td>81-84</td><td>61-64</td></tr><tr><td>S</td><td>85-88</td><td>65-68</td></tr><tr><td>M</td><td>89-92</td><td>69-72</td></tr><tr><td>L</td><td>93-96</td><td>73-76</td></tr></table>"} />;
}
